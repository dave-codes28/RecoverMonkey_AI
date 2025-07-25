export interface Inquiry {
  id: string;
  shop_id: string;
  customer_email: string;
  cart_id: string;
  cart_value: number;
  query_summary: string;
  full_query: string;
  currency: string;
  conversation_id: string;
  status: "Pending" | "Responded" | "Resolved" | string;
  response: string | null;
  created_at: string;
  responded_at: string | null;
}

export interface FAQ {
  id: string;
  shop_id: string;
  question: string;
  answer: string;
  category: string;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  store_id: string;
  customer_email: string;
  messages: any; // JSON or text
  created_at: string;
} 