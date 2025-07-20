'use client'
import React from 'react';
import { ChatMessage as ChatMessageType } from './types';

interface ChatMessageProps {
  message: ChatMessageType;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.sender === 'user';
  return (
    <div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-2`}
      aria-label={isUser ? 'Your message' : 'Bot message'}
    >
      <div
        className={`rounded-lg px-4 py-2 max-w-xs break-words shadow-sm text-sm
          ${isUser ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
      >
        {message.text}
        <span className="block text-xs text-gray-400 mt-1 text-right">
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
}; 