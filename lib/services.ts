import api from './api';
import type {
  LoginPayload,
  RegisterPayload,
  AuthResponse,
  Product,
  Category,
  Order,
  CheckoutFormData,
  ProductsQueryParams,
  PaginatedResponse,
  ApiResponse,
  DashboardStats,
  User,
} from '@/types';

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authService = {
  login: (payload: LoginPayload) =>
    api.post<AuthResponse>('/auth/login', payload).then((r) => r.data),
  register: (payload: RegisterPayload) =>
    api.post<AuthResponse>('/auth/register', payload).then((r) => r.data),
  getMe: () =>
    api.get<ApiResponse<User>>('/auth/me').then((r) => r.data),
  updateProfile: (data: Partial<User>) =>
    api.put<ApiResponse<User>>('/users/profile', data).then((r) => r.data),
};

// ─── Products ─────────────────────────────────────────────────────────────────
export const productService = {
  getAll: (params?: ProductsQueryParams) =>
    api.get<PaginatedResponse<Product>>('/products', { params }).then((r) => r.data),
  getById: (id: string) =>
    api.get<ApiResponse<Product>>(`/products/${id}`).then((r) => r.data),
  getFeatured: () =>
    api.get<ApiResponse<Product[]>>('/products/featured').then((r) => r.data),
  getTrending: () =>
    api.get<ApiResponse<Product[]>>('/products/trending').then((r) => r.data),
  create: (data: Partial<Product>) =>
    api.post<ApiResponse<Product>>('/products', data).then((r) => r.data),
  update: (id: string, data: Partial<Product>) =>
    api.put<ApiResponse<Product>>(`/products/${id}`, data).then((r) => r.data),
  delete: (id: string) =>
    api.delete<ApiResponse<null>>(`/products/${id}`).then((r) => r.data),
};

// ─── Categories ───────────────────────────────────────────────────────────────
export const categoryService = {
  getAll: () =>
    api.get<ApiResponse<Category[]>>('/categories').then((r) => r.data),
  create: (data: Partial<Category>) =>
    api.post<ApiResponse<Category>>('/categories', data).then((r) => r.data),
  delete: (id: string) =>
    api.delete<ApiResponse<null>>(`/categories/${id}`).then((r) => r.data),
};

// ─── Orders ───────────────────────────────────────────────────────────────────
export const orderService = {
  create: (data: CheckoutFormData & { items: Order['items']; totalPrice: number }) =>
    api.post<ApiResponse<Order>>('/orders', data).then((r) => r.data),
  getMyOrders: () =>
    api.get<ApiResponse<Order[]>>('/orders/my').then((r) => r.data),
  getAll: () =>
    api.get<ApiResponse<Order[]>>('/orders').then((r) => r.data),
  updateStatus: (id: string, status: string) =>
    api.put<ApiResponse<Order>>(`/orders/${id}/status`, { status }).then((r) => r.data),
};

// ─── Admin ────────────────────────────────────────────────────────────────────
export const adminService = {
  getStats: () =>
    api.get<ApiResponse<DashboardStats>>('/admin/stats').then((r) => r.data),
  getUsers: () =>
    api.get<ApiResponse<User[]>>('/admin/users').then((r) => r.data),
};
