export interface Product {
  id: string;
  title: string;
  slug: string;
  price: number;
  mrp: number | null;
  category: string;
  fabric: string | null;
  colors: string[];
  images: string[];
  stock_qty: number;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  phone: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  pincode: string;
  landmark: string | null;
  items: OrderItem[];
  total_amount: number;
  status: "NEW" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  created_at: string;
}

export interface OrderItem {
  productId: string;
  title: string;
  price: number;
  qty: number;
  color: string;
  image: string;
}

export interface CartItem {
  productId: string;
  title: string;
  price: number;
  qty: number;
  color: string;
  image: string;
  slug: string;
}

export interface Profile {
  id: string;
  email: string | null;
  is_admin: boolean;
  created_at: string;
}

