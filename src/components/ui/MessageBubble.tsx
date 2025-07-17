import React from 'react';

interface MessageBubbleProps {
  role: string;
  content: string;
}

export default function MessageBubble({ role, content }: MessageBubbleProps) {
  const isUser = role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-xs p-2 rounded-lg ${
          isUser ? 'bg-green-500 text-white' : 'bg-gray-200 text-black'
        }`}
      >
        {content}
      </div>
    </div>
  );
} 