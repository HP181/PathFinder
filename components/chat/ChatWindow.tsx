'use client';
import { useEffect, useState } from 'react';
import { listenToMessages, sendMessage } from '@/lib/Firebase/chat';
import { useAuthStore } from '@/lib/Store/Auth-Store';
export function ChatWindow({ chatId }: { chatId: string }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const { user } = useAuthStore();

  useEffect(() => {
    const unsub = listenToMessages(chatId, setMessages);
    return () => unsub();
  }, [chatId]);

  const handleSend = async () => {
    if (text.trim()) {
      await sendMessage(chatId, user?.uid!, text);
      setText('');
    }
  };

  return (
    <div className="chat-window">
      <div className="messages">
        {messages.map((msg: any) => (
          <div key={msg.id} className={msg.senderId === user?.uid ? 'sent' : 'received'}>
            {msg.text}
          </div>
        ))}
      </div>
      <div className="input">
        <input value={text} onChange={e => setText(e.target.value)} placeholder="Type a message..." />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}
