import { Router } from 'express';
import {
  getProducts, getFeaturedProducts, getTrendingProducts,
  getProductById, createProduct, updateProduct, deleteProduct,
} from '../controllers/productController';
import { protect, adminOnly } from '../middleware/auth';

const router = Router();

router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/trending', getTrendingProducts);
router.get('/:id', getProductById);
router.post('/', protect, adminOnly, createProduct);
router.put('/:id', protect, adminOnly, updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);

export default router;
