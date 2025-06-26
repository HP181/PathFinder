'use client';
import React from 'react';

export const ChatMessage = ({
  message,
  currentUserId
}: {
  message: any;
  currentUserId: string;
}) => {
  const isSender = message.senderId === currentUserId;

  return (
    <div className={`my-2 flex ${isSender ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`rounded-xl px-4 py-2 max-w-xs ${
          isSender ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'
        }`}
      >
        {message.text}
      </div>
    </div>
  );
};
