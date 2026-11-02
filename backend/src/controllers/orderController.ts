import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Order from '../models/Order';
import User from '../models/User';
import Product from '../models/Product';

// POST /api/orders [auth]
export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  const {
    items, shippingAddress, paymentMethod,
    itemsPrice, shippingPrice, totalPrice,
  } = req.body;

  if (!items || items.length === 0) {
    res.status(400);
    throw new Error('No order items');
  }

  // Validate stock before creating the order
  const products = await Product.find({ _id: { $in: items.map((i: { product: string }) => i.product) } });
  const productMap = new Map(products.map((p) => [String(p._id), p]));
  for (const item of items) {
    const product = productMap.get(String(item.product));
    if (!product) {
      res.status(404);
      throw new Error(`Product ${item.product} not found`);
    }
    if (product.stock < item.quantity) {
      res.status(400);
      throw new Error(`Insufficient stock for ${product.name} (only ${product.stock} left)`);
    }
  }

  const order = await Order.create({
    user: req.user!._id,
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

  res.status(201).json({ success: true, data: order });
});

// GET /api/orders/my [auth]
export const getMyOrders = asyncHandler(async (req: Request, res: Response) => {
  const orders = await Order.find({ user: req.user!._id })
    .sort({ createdAt: -1 })
    .populate('items.product', 'name images');
  res.json({ success: true, data: orders });
});

// GET /api/orders [admin]
export const getAllOrders = asyncHandler(async (_req: Request, res: Response) => {
  const orders = await Order.find()
    .sort({ createdAt: -1 })
    .populate('user', 'name email')
    .populate('items.product', 'name');
  res.json({ success: true, data: orders });
});

// PUT /api/orders/:id/status [admin]
export const updateOrderStatus = asyncHandler(async (req: Request, res: Response) => {
  const { status } = req.body;
  const existing = await Order.findById(req.params.id);
  if (!existing) {
    res.status(404);
    throw new Error('Order not found');
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
    req.params.id,
    {
      status,
      ...(status === 'delivered' && { isDelivered: true, deliveredAt: new Date() }),
    },
    { new: true }
  );
  res.json({ success: true, data: order });
});

// GET /api/admin/stats [admin]
export const getDashboardStats = asyncHandler(async (_req: Request, res: Response) => {
  const [totalRevenue, totalOrders, totalProducts, totalUsers, recentOrders] = await Promise.all([
    Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]),
    Order.countDocuments(),
    Product.countDocuments(),
    User.countDocuments(),
    Order.find().sort({ createdAt: -1 }).limit(5).populate('user', 'name email'),
  ]);

  res.json({
    success: true,
    data: {
      totalRevenue: totalRevenue[0]?.total || 0,
      totalOrders,
      totalProducts,
      totalUsers,
      recentOrders,
    },
  });
});

// GET /api/admin/users [admin]
export const getUsers = asyncHandler(async (_req: Request, res: Response) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.json({ success: true, data: users });
});
