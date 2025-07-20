"use client";
import React, { useState, useRef, useEffect } from 'react';

import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { sendMessageToChatbot, logChatbotEvent } from './ChatbotAPI';
import { ChatMessage as ChatMessageType } from './types';

const WIDGET_STORAGE_KEY = 'chatbot-widget-open';

export const CustomerChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(WIDGET_STORAGE_KEY) === 'true';
    }
    return false;
  });
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(WIDGET_STORAGE_KEY, isOpen ? 'true' : 'false');
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (text: string) => {
    setLoading(true);
    setError(null);
    const userMessage: ChatMessageType = {
      id: `${Date.now()}-user`,
      sender: 'user',
      text,
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, userMessage]);
    try {
      const response = await sendMessageToChatbot(text);
      const botMessage: ChatMessageType = {
        id: `${Date.now()}-bot`,
        sender: 'bot',
        text: response.reply,
        timestamp: Date.now(),
        intent: response.intent?.name,
      };
      setMessages(prev => [...prev, botMessage]);
      await logChatbotEvent('chat_message', { user: text, bot: response.reply, intent: response.intent });
    } catch (err) {
      setError('Sorry, something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="w-80 max-w-full bg-background rounded-lg shadow-lg border flex flex-col h-[500px]">
          <div className="flex items-center justify-between p-3 border-b bg-primary text-primary-foreground rounded-t-lg">
            <span className="font-semibold">Chat with us</span>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close chatbot"
              className="ml-2 text-lg font-bold hover:opacity-70"
            >
              ×
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 bg-background">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground text-sm mt-8">How can we help you today?</div>
            )}
            {messages.map(msg => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            <div ref={messagesEndRef} />
          </div>
          {error && <div className="text-red-500 text-xs px-3 pb-1">{error}</div>}
          <ChatInput onSend={handleSend} loading={loading} />
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="rounded-full bg-primary text-primary-foreground shadow-lg p-4 hover:scale-105 transition-transform focus:outline-none"
          aria-label="Open chatbot"
        >
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-circle"><circle cx="12" cy="12" r="10"/><path d="M8 12h.01M12 12h.01M16 12h.01"/></svg>
        </button>
      )}
    </div>
  );
}; 