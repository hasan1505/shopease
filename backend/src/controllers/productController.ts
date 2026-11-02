import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Product from '../models/Product';
import Category from '../models/Category';

// GET /api/products
export const getProducts = asyncHandler(async (req: Request, res: Response) => {
  const { search, category, sort, page = '1', limit = '12', minPrice, maxPrice } = req.query;

  const query: Record<string, unknown> = {};

  // Search
  if (search) {
    query.$text = { $search: search as string };
  }

  // Category filter
  if (category) {
    const cat = await Category.findOne({ slug: category as string });
    if (cat) query.category = cat._id;
  }

  // Price range
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) (query.price as Record<string, number>).$gte = Number(minPrice);
    if (maxPrice) (query.price as Record<string, number>).$lte = Number(maxPrice);
  }

  // Sort
  let sortObj: Record<string, 1 | -1> = { createdAt: -1 };
  if (sort === 'price_asc') sortObj = { price: 1 };
  else if (sort === 'price_desc') sortObj = { price: -1 };
  else if (sort === 'rating') sortObj = { rating: -1 };

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const [products, total] = await Promise.all([
    Product.find(query).sort(sortObj).skip(skip).limit(limitNum).populate('category', 'name slug'),
    Product.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: products,
    pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
  });
});

// GET /api/products/featured
export const getFeaturedProducts = asyncHandler(async (_req: Request, res: Response) => {
  const products = await Product.find({ isFeatured: true }).limit(8).populate('category', 'name slug');
  res.json({ success: true, data: products });
});

// GET /api/products/trending
export const getTrendingProducts = asyncHandler(async (_req: Request, res: Response) => {
  const products = await Product.find({ isTrending: true }).limit(8).populate('category', 'name slug');
  res.json({ success: true, data: products });
});

// GET /api/products/:id
export const getProductById = asyncHandler(async (req: Request, res: Response) => {
  const product = await Product.findById(req.params.id).populate('category', 'name slug');
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  res.json({ success: true, data: product });
});

// POST /api/products [admin]
export const createProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await Product.create(req.body);
  res.status(201).json({ success: true, data: product });
});

// PUT /api/products/:id [admin]
export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  res.json({ success: true, data: product });
});

// DELETE /api/products/:id [admin]
export const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  res.json({ success: true, data: null });
});
