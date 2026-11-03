// Seed the database with demo data: 6 categories, 24 products, 2 users.
// Usage: npm run seed   (reads MONGODB_URI from .env.local or environment)
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import fs from 'node:fs';

// Minimal .env.local loader (no dotenv dependency)
try {
  const env = fs.readFileSync(new URL('../.env.local', import.meta.url), 'utf8');
  for (const line of env.split('\n')) {
    const m = line.match(/^\s*([\w.]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
} catch { /* .env.local optional */ }

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/shopease';

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  image: { type: String, required: true },
  description: { type: String, default: '' },
}, { timestamps: true });

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  originalPrice: { type: Number, min: 0 },
  images: [{ type: String }],
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  brand: { type: String, required: true, trim: true },
  stock: { type: Number, required: true, min: 0, default: 0 },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  numReviews: { type: Number, default: 0 },
  tags: [{ type: String }],
  isFeatured: { type: Boolean, default: false },
  isTrending: { type: Boolean, default: false },
}, { timestamps: true });
productSchema.index({ name: 'text', description: 'text', brand: 'text' });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6, select: false },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
}, { timestamps: true });

const Category = mongoose.model('Category', categorySchema);
const Product = mongoose.model('Product', productSchema);
const User = mongoose.model('User', userSchema);

const categories = [
  { name: 'Electronics', slug: 'electronics', description: 'Gadgets and electronic devices', image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=500&fit=crop' },
  { name: 'Fashion', slug: 'fashion', description: 'Clothing, shoes, and accessories', image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=500&fit=crop' },
  { name: 'Home & Kitchen', slug: 'home-kitchen', description: 'Furniture and kitchen items', image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=500&fit=crop' },
  { name: 'Books', slug: 'books', description: 'Books and educational material', image: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400&h=500&fit=crop' },
  { name: 'Sports', slug: 'sports', description: 'Sports equipment and activewear', image: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=400&h=500&fit=crop' },
  { name: 'Beauty', slug: 'beauty', description: 'Skincare, makeup, and wellness', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=500&fit=crop' },
];

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('🔌 Connected to MongoDB');

  await Promise.all([User.deleteMany({}), Category.deleteMany({}), Product.deleteMany({})]);
  console.log('🗑️  Cleared existing data');

  const createdCategories = await Category.insertMany(categories);
  console.log(`📦 Created ${createdCategories.length} categories`);
  const catMap = Object.fromEntries(createdCategories.map((c) => [c.slug, c._id]));

  const adminPass = await bcrypt.hash('admin123', 12);
  const userPass = await bcrypt.hash('user123', 12);
  await User.create([
    { name: 'Admin User', email: 'admin@shopease.com', password: adminPass, role: 'admin' },
    { name: 'John Doe', email: 'user@shopease.com', password: userPass, role: 'user' },
  ]);
  console.log('👤 Created 2 users');

  const products = [
    { name: 'Apple AirPods Pro 2nd Gen', description: 'Advanced noise cancellation with Adaptive Transparency mode. Up to 6 hours of listening time, and up to 30 hours total with the charging case.', price: 249.00, originalPrice: 299.00, images: ['https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=600&h=600&fit=crop'], category: catMap['electronics'], brand: 'Apple', stock: 45, rating: 4.8, numReviews: 2841, isFeatured: true, isTrending: true, tags: ['apple', 'earbuds', 'wireless'] },
    { name: 'Samsung 55" 4K OLED Smart TV', description: 'Stunning 4K OLED display with AI-powered picture quality, built-in streaming apps, and immersive sound system.', price: 899.00, originalPrice: 1199.00, images: ['https://images.unsplash.com/photo-1593784991095-a205069470b6?w=600&h=600&fit=crop'], category: catMap['electronics'], brand: 'Samsung', stock: 18, rating: 4.7, numReviews: 1203, isFeatured: true, isTrending: false, tags: ['tv', 'oled', '4k'] },
    { name: 'Sony WH-1000XM5 Headphones', description: 'Industry-leading noise canceling with eight microphones. Up to 30-hour battery life with quick charge capability.', price: 299.00, originalPrice: 399.00, images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop'], category: catMap['electronics'], brand: 'Sony', stock: 32, rating: 4.9, numReviews: 4521, isFeatured: true, isTrending: true, tags: ['headphones', 'noise-canceling', 'sony'] },
    { name: 'iPad Pro 12.9" M2 Chip', description: 'The most powerful iPad ever with the Apple M2 chip, Liquid Retina XDR display, and Apple Pencil support.', price: 1099.00, originalPrice: 1299.00, images: ['https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&h=600&fit=crop'], category: catMap['electronics'], brand: 'Apple', stock: 24, rating: 4.8, numReviews: 987, isFeatured: false, isTrending: true, tags: ['ipad', 'tablet', 'apple'] },
    { name: 'Mechanical Gaming Keyboard RGB', description: 'Premium tactile mechanical switches with per-key RGB lighting, anti-ghosting, and aluminum frame construction.', price: 129.00, originalPrice: 159.00, images: ['https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&h=600&fit=crop'], category: catMap['electronics'], brand: 'Corsair', stock: 56, rating: 4.6, numReviews: 1876, isFeatured: false, isTrending: true, tags: ['keyboard', 'gaming', 'rgb'] },
    { name: 'Logitech MX Master 3 Mouse', description: 'Advanced wireless mouse with MagSpeed scroll wheel, ergonomic design, and multi-device connectivity.', price: 99.00, originalPrice: 129.00, images: ['https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&h=600&fit=crop'], category: catMap['electronics'], brand: 'Logitech', stock: 78, rating: 4.7, numReviews: 3241, isFeatured: false, isTrending: false, tags: ['mouse', 'wireless', 'logitech'] },
    { name: 'Premium Leather Jacket', description: 'Genuine full-grain leather jacket with quilted interior lining. Classic biker style with multiple zipper pockets.', price: 299.00, originalPrice: 450.00, images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&h=600&fit=crop'], category: catMap['fashion'], brand: 'Calvin Klein', stock: 20, rating: 4.6, numReviews: 543, isFeatured: true, isTrending: false, tags: ['jacket', 'leather', 'fashion'] },
    { name: "Men's Classic Oxford Shoes", description: 'Hand-stitched full leather upper with rubber sole. Perfect for business and formal occasions.', price: 189.00, originalPrice: 249.00, images: ['https://images.unsplash.com/photo-1449505278894-297fdb3edbc1?w=600&h=600&fit=crop'], category: catMap['fashion'], brand: 'Allen Edmonds', stock: 35, rating: 4.5, numReviews: 328, isFeatured: false, isTrending: false, tags: ['shoes', 'formal', 'leather'] },
    { name: 'Cashmere Turtleneck Sweater', description: '100% pure Mongolian cashmere. Ultra-soft and warm with a ribbed turtleneck collar and cuffs.', price: 149.00, originalPrice: 199.00, images: ['https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&h=600&fit=crop'], category: catMap['fashion'], brand: 'J.Crew', stock: 42, rating: 4.7, numReviews: 712, isFeatured: true, isTrending: false, tags: ['sweater', 'cashmere', 'winter'] },
    { name: "Women's Running Sneakers", description: 'Lightweight responsive foam cushioning with breathable mesh upper. Ideal for everyday runs and gym sessions.', price: 119.00, originalPrice: 149.00, images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop'], category: catMap['fashion'], brand: 'Nike', stock: 67, rating: 4.8, numReviews: 2156, isFeatured: false, isTrending: true, tags: ['sneakers', 'running', 'nike'] },
    { name: 'Designer Crossbody Bag', description: 'Premium vegan leather crossbody bag with gold-tone hardware, adjustable strap, and multiple compartments.', price: 89.00, originalPrice: 129.00, images: ['https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=600&fit=crop'], category: catMap['fashion'], brand: 'Coach', stock: 28, rating: 4.5, numReviews: 891, isFeatured: false, isTrending: true, tags: ['bag', 'crossbody', 'accessories'] },
    { name: 'Classic Denim Jeans', description: 'Premium stretch denim with a slim straight fit. Timeless 5-pocket construction with subtle fading.', price: 79.00, originalPrice: 99.00, images: ['https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&h=600&fit=crop'], category: catMap['fashion'], brand: "Levi's", stock: 89, rating: 4.4, numReviews: 1432, isFeatured: false, isTrending: false, tags: ['jeans', 'denim', 'casual'] },
    { name: 'Nespresso Vertuo Next Coffee Maker', description: 'One-touch brewing system for espresso and coffee. Compatible with all Vertuo capsules. 37oz removable water tank.', price: 179.00, originalPrice: 229.00, images: ['https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=600&fit=crop'], category: catMap['home-kitchen'], brand: 'Nespresso', stock: 41, rating: 4.7, numReviews: 2341, isFeatured: true, isTrending: true, tags: ['coffee', 'kitchen', 'espresso'] },
    { name: 'KitchenAid Stand Mixer 5Qt', description: 'Professional 5-quart stainless steel bowl with tilt-head design. 10 speeds with planetary mixing action.', price: 449.00, originalPrice: 549.00, images: ['https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&h=600&fit=crop'], category: catMap['home-kitchen'], brand: 'KitchenAid', stock: 15, rating: 4.9, numReviews: 5678, isFeatured: true, isTrending: false, tags: ['mixer', 'baking', 'kitchen'] },
    { name: 'Bamboo Cutting Board Set', description: 'Set of 3 premium bamboo cutting boards. Naturally antibacterial, eco-friendly with juice groove and handles.', price: 49.00, originalPrice: 69.00, images: ['https://images.unsplash.com/photo-1556909212-d5b604d0c90d?w=600&h=600&fit=crop'], category: catMap['home-kitchen'], brand: 'OXO', stock: 92, rating: 4.6, numReviews: 1123, isFeatured: false, isTrending: false, tags: ['cutting-board', 'bamboo', 'eco'] },
    { name: 'Smart LED Desk Lamp', description: 'Wireless charging base, 5 color temperatures, 5 brightness levels, USB-A port, and auto-dimming feature.', price: 59.00, originalPrice: 79.00, images: ['https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?w=600&h=600&fit=crop'], category: catMap['home-kitchen'], brand: 'BenQ', stock: 54, rating: 4.5, numReviews: 876, isFeatured: false, isTrending: true, tags: ['lamp', 'desk', 'smart'] },
    { name: 'Atomic Habits — James Clear', description: 'The life-changing million copy bestseller. A revolutionary system to get 1% better every day and transform your habits.', price: 18.00, originalPrice: 27.00, images: ['https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&h=600&fit=crop'], category: catMap['books'], brand: 'Avery', stock: 200, rating: 4.9, numReviews: 89432, isFeatured: true, isTrending: true, tags: ['habits', 'self-help', 'bestseller'] },
    { name: 'The Psychology of Money', description: 'Timeless lessons on wealth, greed, and happiness. Morgan Housel explores the intersection of money and behavior.', price: 16.00, originalPrice: 22.00, images: ['https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&h=600&fit=crop'], category: catMap['books'], brand: 'Harriman House', stock: 150, rating: 4.8, numReviews: 45231, isFeatured: false, isTrending: true, tags: ['finance', 'psychology', 'money'] },
    { name: 'Yoga Mat Premium Non-Slip', description: 'Extra thick 6mm TPE foam yoga mat with alignment lines, carrying strap, and superior grip surface.', price: 65.00, originalPrice: 89.00, images: ['https://images.unsplash.com/photo-1601925228518-3f5a5a4e1a8a?w=600&h=600&fit=crop'], category: catMap['sports'], brand: 'Manduka', stock: 73, rating: 4.7, numReviews: 2341, isFeatured: false, isTrending: true, tags: ['yoga', 'fitness', 'mat'] },
    { name: 'Adjustable Dumbbell Set 5-50lbs', description: 'Space-saving adjustable dumbbells replacing 15 sets. Quick dial adjustment mechanism, durable steel construction.', price: 349.00, originalPrice: 449.00, images: ['https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=600&fit=crop'], category: catMap['sports'], brand: 'Bowflex', stock: 22, rating: 4.8, numReviews: 3412, isFeatured: true, isTrending: true, tags: ['dumbbells', 'weights', 'fitness'] },
    { name: 'Foam Roller for Recovery', description: 'High-density foam roller for muscle recovery and myofascial release. Grid texture for effective deep tissue massage.', price: 35.00, originalPrice: 45.00, images: ['https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=600&fit=crop'], category: catMap['sports'], brand: 'TriggerPoint', stock: 96, rating: 4.5, numReviews: 1876, isFeatured: false, isTrending: false, tags: ['recovery', 'foam-roller', 'massage'] },
    { name: 'Vitamin C Serum 20%', description: 'Professional-grade vitamin C serum with hyaluronic acid and vitamin E. Brightens skin and reduces dark spots.', price: 45.00, originalPrice: 65.00, images: ['https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=600&h=600&fit=crop'], category: catMap['beauty'], brand: "Paula's Choice", stock: 84, rating: 4.8, numReviews: 6541, isFeatured: true, isTrending: true, tags: ['skincare', 'vitamin-c', 'serum'] },
    { name: 'Hair Dryer Pro 1800W', description: 'Ionic technology reduces frizz by 75%. 3 heat settings, 2 speed settings, cool shot button, concentrator nozzle.', price: 79.00, originalPrice: 109.00, images: ['https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=600&h=600&fit=crop'], category: catMap['beauty'], brand: 'Dyson', stock: 37, rating: 4.6, numReviews: 2134, isFeatured: false, isTrending: true, tags: ['hair', 'styling', 'ionic'] },
    { name: 'SPF 50 Sunscreen Daily', description: 'Lightweight non-greasy broad spectrum SPF 50 sunscreen with antioxidants. Water resistant up to 80 minutes.', price: 28.00, originalPrice: 38.00, images: ['https://images.unsplash.com/photo-1526758097130-bab247274f58?w=600&h=600&fit=crop'], category: catMap['beauty'], brand: 'EltaMD', stock: 112, rating: 4.9, numReviews: 8932, isFeatured: false, isTrending: false, tags: ['sunscreen', 'spf', 'skincare'] },
  ];

  await Product.insertMany(products);
  console.log(`🛒 Created ${products.length} products`);

  console.log('\n✅ Database seeded successfully!');
  console.log('📧 Admin: admin@shopease.com / admin123');
  console.log('📧 User:  user@shopease.com  / user123');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed error:', err);
  process.exit(1);
});
