export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total?: number;
  hasMore?: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: PaginationMeta;
}

export interface Product {
  id: string;
  name: string;
  slug?: string;
  price: number;
  image: string;
  images: string[];
  category: string;
  fabric: string;
  occasion: string;
  description: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  stockQty?: number;
  mrp?: number | null;
  colors?: string[];
  careInstructions?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiProduct {
  id: string;
  title?: string;
  name?: string;
  slug?: string;
  price: number;
  mrp?: number | null;
  image?: string;
  images?: string[];
  category?: string;
  fabric?: string | null;
  occasion?: string | null;
  description?: string | null;
  rating?: number | null;
  reviews?: number | null;
  inStock?: boolean;
  stock_qty?: number | null;
  is_active?: boolean;
  colors?: string[];
  careInstructions?: string[];
  care_instructions?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface OrderItem {
  productId: string;
  title: string;
  price: number;
  qty: number;
  color?: string;
  image: string;
}

export type ApiOrderStatus =
  | 'NEW'
  | 'CONFIRMED'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export interface Address {
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
}

export interface Order {
  id: string;
  date: string;
  status: OrderStatus;
  items: CartItem[];
  total: number;
  address: Address;
}

export interface ApiOrder {
  id: string;
  customer_name?: string;
  customer_email?: string | null;
  phone?: string;
  address_line1?: string;
  address_line2?: string | null;
  city?: string;
  state?: string;
  pincode?: string;
  landmark?: string | null;
  items?: OrderItem[];
  total_amount?: number;
  status?: ApiOrderStatus | OrderStatus;
  created_at?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  defaultAddress?: Address;
}

export interface ApiUser {
  id: string;
  name?: string | null;
  full_name?: string | null;
  email?: string | null;
  phone?: string | null;
  defaultAddress?: Address;
  default_address?: Address;
  user_metadata?: {
    name?: string;
    full_name?: string;
    phone?: string;
    default_address?: Address;
  };
}

export interface AuthState {
  isLoggedIn: boolean;
  user: User | null;
  token: string | null;
}

export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CheckoutPayload {
  address: Address;
  items: CartItem[];
  total: number;
  paymentMethod: 'cash_on_delivery';
}
