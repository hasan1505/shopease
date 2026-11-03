import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Product from '@/lib/models/Product';


export async function GET() {
  try {
    await connectDB();
    const products = await Product.find({ isTrending: true }).limit(8).populate('category', 'name slug');
    return NextResponse.json({ success: true, data: products });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err instanceof Error ? err.message : 'Failed to load products' },
      { status: 500 }
    );
  }
}
