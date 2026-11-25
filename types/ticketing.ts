export interface TicketCategory {
  id: string
  name: string
  description: string
  price_in_paise: number
  quantity: number
  quantity_sold?: number
  quantity_reserved?: number
  sales_start: string
  sales_end: string
  is_active: boolean
  is_recommended?: boolean
  is_sold_out?: boolean
}

export interface OrderItem {
  category_id: string
  category_name: string
  quantity: number
  unit_price: number
  subtotal: number
}

export interface OrderCheckoutInfo {
  key: string
  order_id: string
  amount: number
  currency: string
}

export interface Order {
  id: string
  user_id: string
  items: OrderItem[]
  total_amount: number
  currency: string
  coupon_code?: string | null
  discount_percent?: number | null
  discount_amount?: number | null
  original_amount?: number | null
  status: "pending" | "paid" | "failed" | "cancelled" | "expired"
  payment_status: string
  razorpay_order_id?: string
  razorpay_key_id?: string
  checkout?: OrderCheckoutInfo
  expires_at: string
  created_at: string
  updated_at: string
}

export interface Ticket {
  id: string
  order_id: string
  category_id: string
  category_name: string
  ticket_code: string
  status: "valid" | "used" | "cancelled" | "refunded"
  created_at: string
  updated_at: string
}

export interface TicketListResponse {
  tickets: Ticket[]
  total: number
}
