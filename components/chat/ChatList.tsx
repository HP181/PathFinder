'use client';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { useAuthStore } from '@/lib/Store/Auth-Store'; // You must create this if not done already

export default function ChatPage() {
  const { user } = useAuthStore();
  const chatId = 'sample_chat_room';

  if (!user) return <p>Loading user...</p>;

  return (
    <main className="p-4">
      <h1 className="text-xl font-bold mb-4">Chat Room</h1>
      <ChatWindow chatId={chatId} />
    </main>
  );
}
