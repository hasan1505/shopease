import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/lib/models/User';
import { signToken } from '@/lib/auth-utils';


export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { name, email, password } = await req.json();

    const exists = await User.findOne({ email });
    if (exists) {
      return NextResponse.json({ success: false, message: 'Email already registered' }, { status: 400 });
    }

    const user = await User.create({ name, email, password });
    const token = signToken(String(user._id));
    return NextResponse.json(
      {
        success: true,
        token,
        user: { _id: user._id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt },
      },
      { status: 201 }
    );
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err instanceof Error ? err.message : 'Registration failed' },
      { status: 500 }
    );
  }
}
