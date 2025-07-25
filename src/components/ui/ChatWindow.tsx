"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import MessageBubble from './MessageBubble'; // Ensure MessageBubble is updated too
// TODO: Implement useChat hook in lib/chatbot/hooks or adjust import path if it exists
// import { useChat } from '@/lib/chatbot/hooks';

interface ChatWindowProps {
  shopId: string;
  onClose: () => void;
  customerId?: string;
}

export default function ChatWindow({ shopId, onClose, customerId }: ChatWindowProps) {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  // TODO: Replace with actual session management
  const sessionId = 'dummy-session-id'; // useChat(shopId, customerId)
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !sessionId) return;

    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, message: input, shop_id: shopId, customer_id: customerId }),
      });
      const data = await response.json();
      setMessages((prev) => [...prev, { role: 'assistant', content: data.response }]);
    } catch (error) {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Sorry, an error occurred.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-16 right-4 w-80 bg-gray-900 rounded-lg shadow-lg border border-gray-800 flex flex-col h-96">
      <div className="p-2 bg-green-500 text-white rounded-t-lg flex justify-between items-center">
        <h3 className="text-sm font-semibold">Chat with Us</h3>
        <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:text-gray-200">
          ×
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-2 bg-gray-900">
        {messages.map((msg, index) => (
          <MessageBubble key={index} role={msg.role} content={msg.content} />
        ))}
        {isTyping && <div className="text-gray-400 text-sm">Typing...</div>}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-2 border-t border-gray-800 bg-gray-900">
        <div className="flex space-x-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button onClick={handleSend} className="bg-green-500 text-white hover:bg-green-600">
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}