/* ─── Shared TypeScript Definitions ─── */

// === Auth ===
export interface Admin {
  id: number;
  username: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

// === Products ===
export interface Product {
  id: number;
  name: string;
  daily_rate: number;
  deposit_amount: number;
  quantity_available: number;
  created_at: string;
  updated_at: string;
}

export interface ProductInput {
  name: string;
  daily_rate: number;
  deposit_amount: number;
  quantity_available: number;
}

// === Rentals ===
export type RentalStatus = "Active" | "Overdue" | "Completed";

export interface Rental {
  id: number;
  product_id: number;
  product_name: string;
  customer_name: string;
  customer_phone: string;
  start_date: string;
  due_date: string;
  deposit_amount: number;
  status: RentalStatus;
  actual_return_date: string | null;
  late_fee_charged: number | null;
  deposit_refunded: number | null;
  settled_at: string | null;
}

export interface RentalInput {
  product_id: number;
  customer_name: string;
  customer_phone: string;
  start_date: string;
  due_date: string;
  deposit_amount: number;
}

export interface ReturnInput {
  actual_return_date: string;
}

// === Dashboard ===
export interface DashboardStats {
  active_rentals: number;
  due_today: number;
  overdue: number;
  deposits_held: number;
}

// === Filters ===
export type DashboardFilter = "All" | "Active" | "Due Today" | "Overdue" | "Completed";
