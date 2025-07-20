'use client'
import React, { useState } from 'react';

interface ChatInputProps {
  onSend: (message: string) => void;
  loading?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSend, loading }) => {
  const [input, setInput] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSend(input.trim());
      setInput('');
    }
  };

  return (
    <form onSubmit={handleSend} className="flex items-center gap-2 p-2 border-t bg-background">
      <input
        type="text"
        className="flex-1 rounded border px-3 py-2 text-sm focus:outline-none focus:ring"
        placeholder="Type your message..."
        value={input}
        onChange={e => setInput(e.target.value)}
        disabled={loading}
        aria-label="Chat message input"
      />
      <button
        type="submit"
        className="px-4 py-2 rounded bg-primary text-primary-foreground disabled:opacity-50"
        disabled={loading || !input.trim()}
        aria-label="Send message"
      >
        Send
      </button>
    </form>
  );
}; 