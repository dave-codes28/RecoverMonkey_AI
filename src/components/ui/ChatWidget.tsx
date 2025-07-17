"use client";
import { useState } from 'react';
import ChatWindow from '../ChatWindow';

export default function ChatWidget({ shopId }: { shopId: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-4 right-4">
      <button
        onClick={() => setIsOpen(true)}
        className="bg-green-500 text-white p-3 rounded-full shadow-lg"
      >
        Chat
      </button>
      {isOpen && <ChatWindow shopId={shopId} onClose={() => setIsOpen(false)} />}
    </div>
  );
} 