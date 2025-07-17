'use client'
import { CustomerChatbot } from '@/components/chatbot/CustomerChatbot';
export default function TestChat() {
  // You can pass context values to CustomerChatbot if needed
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <CustomerChatbot />
    </div>
  );
} 