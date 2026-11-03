import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Order from '@/lib/models/Order';
import Product from '@/lib/models/Product';
import { getAuthUser } from '@/lib/auth-utils';


// POST /api/orders — place an order [auth] (validates & decrements stock)
export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
  }
  try {
    await connectDB();
    const { items, shippingAddress, paymentMethod, itemsPrice, shippingPrice, totalPrice } =
      await req.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ success: false, message: 'No order items' }, { status: 400 });
    }

    // Validate stock before creating the order
    const products = await Product.find({
      _id: { $in: items.map((i: { product: string }) => i.product) },
    });
    const productMap = new Map(products.map((p) => [String(p._id), p]));
    for (const item of items) {
      const product = productMap.get(String(item.product));
      if (!product) {
        return NextResponse.json(
          { success: false, message: `Product ${item.product} not found` },
          { status: 404 }
        );
      }
      if (product.stock < item.quantity) {
        return NextResponse.json(
          { success: false, message: `Insufficient stock for ${product.name} (only ${product.stock} left)` },
          { status: 400 }
        );
      }
    }

    const order = await Order.create({
      user: user._id,
      items,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      totalPrice,
    });

    // Decrement stock atomically; roll back the order if any update fails
    try {
      await Promise.all(
        items.map((item: { product: string; quantity: number }) =>
          Product.updateOne(
            { _id: item.product, stock: { $gte: item.quantity } },
            { $inc: { stock: -item.quantity } }
          )
        )
      );
    } catch (err) {
      await Order.findByIdAndDelete(order._id);
      throw err;
    }

    return NextResponse.json({ success: true, data: order }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err instanceof Error ? err.message : 'Failed to place order' },
      { status: 500 }
    );
  }
}

// GET /api/orders — all orders [admin]
export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
  }
  if (user.role !== 'admin') {
    return NextResponse.json({ success: false, message: 'Admin access required' }, { status: 403 });
  }
  try {
    await connectDB();
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate('user', 'name email')
      .populate('items.product', 'name');
    return NextResponse.json({ success: true, data: orders });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err instanceof Error ? err.message : 'Failed to load orders' },
      { status: 500 }
    );
  }
}
