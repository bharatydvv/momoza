export type UserRole = "customer" | "admin" | "delivery";

export type OrderStatus =
  | "order_received"
  | "cooking"
  | "packing"
  | "out_for_delivery"
  | "arrived"
  | "delivered"
  | "cancelled";

export type RefundStatus = "pending" | "approved" | "rejected";

export interface Profile {
  id: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  role: UserRole;
  coins_balance: number;
  referral_code: string | null;
  referred_by: string | null;
  created_at: string;
}

export interface Category {
  id: string;
  title: string;
  sequence_number: number;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  discounted_price: number | null;
  image_url: string | null;
  category_id: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Offer {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  product_ids: string[];
  price: number | null;
  discounted_price: number | null;
  is_active: boolean;
  created_at: string;
}

export interface CartItem {
  product_id: string;
  name: string;
  price: number;
  image_url: string | null;
  quantity: number;
}

export interface Order {
  id: string;
  user_id: string | null;
  items: CartItem[];
  total_amount: number;
  coins_redeemed: number;
  coins_earned: number;
  address: string | null;
  pincode: string | null;
  phone: string | null;
  status: OrderStatus;
  delivery_boy_id: string | null;
  created_at: string;
}

export interface DeliveryBoy {
  id: string;
  user_id: string | null;
  name: string;
  phone: string | null;
  email: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Refund {
  id: string;
  order_id: string;
  user_id: string;
  reason: string | null;
  status: RefundStatus;
  created_at: string;
}

export interface CoinTransaction {
  id: string;
  user_id: string;
  order_id: string | null;
  coins_earned: number;
  coins_redeemed: number;
  note: string | null;
  created_at: string;
}

export const ORDER_FLOW: OrderStatus[] = [
  "cooking",
  "packing",
  "out_for_delivery",
  "arrived",
];

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  order_received: "Order Received",
  cooking: "Cooking",
  packing: "Packing",
  out_for_delivery: "Out for Delivery",
  arrived: "Arrived",
  delivered: "Delivered",
  cancelled: "Cancelled",
};
