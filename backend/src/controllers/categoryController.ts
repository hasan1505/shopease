import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Category from '../models/Category';
import Product from '../models/Product';

// GET /api/categories
export const getCategories = asyncHandler(async (_req: Request, res: Response) => {
  const categories = await Category.find().sort({ name: 1 });

  // Append product count
  const withCounts = await Promise.all(
    categories.map(async (cat) => {
      const count = await Product.countDocuments({ category: cat._id });
      return { ...cat.toObject(), productCount: count };
    })
  );

  res.json({ success: true, data: withCounts });
});

// POST /api/categories [admin]
export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await Category.create(req.body);
  res.status(201).json({ success: true, data: category });
});

// DELETE /api/categories/:id [admin]
export const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
  await Category.findByIdAndDelete(req.params.id);
  res.json({ success: true, data: null });
});
