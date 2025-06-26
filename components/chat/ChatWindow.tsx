'use client';
import { useEffect, useState, useRef } from 'react';
import { listenToMessages, sendMessage } from '@/lib/Firebase/chat';
import { useAuthStore } from '@/lib/Store/Auth-Store';

export function ChatWindow({ chatId }: { chatId: string }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');
  const { user } = useAuthStore();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const unsub = listenToMessages(chatId, setMessages);
    return () => unsub();
  }, [chatId]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (text.trim()) {
      await sendMessage(chatId, user?.uid!, text);
      setText('');
    }
  };

  return (
    <div className="relative h-[70vh] md:h-[80vh] flex flex-col glass rounded-2xl shadow-lg p-4">
      <div className="flex-1 overflow-y-auto flex flex-col justify-end space-y-2 pr-2">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`max-w-xs md:max-w-sm px-3 py-2 rounded-lg text-sm 
              ${msg.senderId === user?.uid 
                ? 'self-end bg-blue-500 text-white' 
                : 'self-start bg-white/20 text-white border border-white/30'}`}
          >
            {msg.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="mt-2 flex bg-white/10 backdrop-blur rounded-xl p-2">
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
          placeholder="Type a message..."
          className="flex-1 bg-transparent outline-none text-white placeholder-white/50 px-2"
        />
        <button
          onClick={handleSend}
          className="ml-2 px-4 py-1 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition"
        >
          Send
        </button>
      </div>
    </div>
  );
}
