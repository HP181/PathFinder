'use client';
import React, { useState } from 'react';
import { sendMessage } from '@/lib/Firebase/chat';

export const ChatInput = ({
  chatId,
  userId
}: {
  chatId: string;
  userId: string;
}) => {
  const [text, setText] = useState('');

  const handleSend = async () => {
    if (text.trim()) {
      await sendMessage(chatId, userId, text.trim());
      setText('');
    }
  };

  return (
    <div className="flex gap-2 mt-4">
      <input
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Type a message"
        className="flex-1 rounded-lg border px-4 py-2"
      />
      <button
        onClick={handleSend}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg"
      >
        Send
      </button>
    </div>
  );
};
