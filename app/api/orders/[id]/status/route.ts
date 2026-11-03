import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Order from '@/lib/models/Order';
import Product from '@/lib/models/Product';
import { getAuthUser } from '@/lib/auth-utils';


// PUT /api/orders/:id/status — update status [admin] (restores stock on cancel)
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
  }
  if (user.role !== 'admin') {
    return NextResponse.json({ success: false, message: 'Admin access required' }, { status: 403 });
  }
  try {
    await connectDB();
    const { id } = await params;
    const { status } = await req.json();

    const existing = await Order.findById(id);
    if (!existing) {
      return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
    }

    // Return reserved stock to inventory when an order is cancelled
    if (status === 'cancelled' && existing.status !== 'cancelled') {
      await Promise.all(
        existing.items.map((item) =>
          Product.updateOne({ _id: item.product }, { $inc: { stock: item.quantity } })
        )
      );
    }

    const order = await Order.findByIdAndUpdate(
      id,
      {
        status,
        ...(status === 'delivered' && { isDelivered: true, deliveredAt: new Date() }),
      },
      { new: true }
    );
    return NextResponse.json({ success: true, data: order });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err instanceof Error ? err.message : 'Failed to update order' },
      { status: 500 }
    );
  }
}
