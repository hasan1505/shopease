import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import User from '../models/User';
import { signToken } from '../utils/jwt';

// POST /api/auth/register
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  const exists = await User.findOne({ email });
  if (exists) {
    res.status(400);
    throw new Error('Email already registered');
  }
  const user = await User.create({ name, email, password });
  const token = signToken(String(user._id));
  res.status(201).json({
    success: true,
    token,
    user: { _id: user._id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt },
  });
});

// POST /api/auth/login
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }
  const token = signToken(String(user._id));
  res.json({
    success: true,
    token,
    user: { _id: user._id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt },
  });
});

// GET /api/auth/me
export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.user!._id);
  res.json({ success: true, data: user });
});

// PUT /api/users/profile
export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const { name, phone, address } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user!._id,
    { name, phone, address },
    { new: true, runValidators: true }
  );
  res.json({ success: true, data: user });
});
