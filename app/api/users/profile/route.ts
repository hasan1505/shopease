import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/lib/models/User';
import { getAuthUser } from '@/lib/auth-utils';


export async function PUT(req: NextRequest) {
  const authUser = await getAuthUser(req);
  if (!authUser) {
    return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
  }
  try {
    const { name, phone, address } = await req.json();
    const user = await User.findByIdAndUpdate(
      authUser._id,
      { name, phone, address },
      { new: true, runValidators: true }
    );
    return NextResponse.json({ success: true, data: user });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err instanceof Error ? err.message : 'Update failed' },
      { status: 500 }
    );
  }
}
