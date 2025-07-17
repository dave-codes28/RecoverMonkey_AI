'use client'
import { ChatMessage, ChatbotAPIResponse } from './types';

// Send a message to the chatbot backend API
export async function sendMessageToChatbot(message: string, context?: Record<string, any>): Promise<ChatbotAPIResponse> {
  const session_id = context?.session_id || 'demo-session';
  const shop_id = context?.shop_id || 'demo-shop';
  const customer_id = context?.customer_id || 'demo-customer';

  const res = await fetch('/api/message', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id, message, shop_id, customer_id }),
  });
  if (!res.ok) throw new Error('Failed to send message to chatbot API');
  const data = await res.json();
  return {
    reply: data.response,
    intent: data.intent ? { name: data.intent, confidence: 1 } : undefined,
    actions: [],
  };
}

// Log an event to Supabase (or your backend)
export async function logChatbotEvent(event: string, data?: Record<string, any>): Promise<void> {
  // Optionally implement a logging endpoint if needed
  // await fetch('/api/chatbot/log', { ... });
} 