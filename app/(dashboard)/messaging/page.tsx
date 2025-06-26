"use client"
import { ChatWindow } from '@/components/chat/ChatWindow';
import { useEffect, useState } from 'react';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { useAuthStore } from '@/lib/Store/Auth-Store';
export default function ChatPage() {
  const [chatId,setCurrentChatId] = useState<string | null>(null);
  type User = {
    userId: string;
    name: string;
    role: string;
  };
  const { user } = useAuthStore();
  const [currentUserId, setCurrentUser] = useState<string | null>(null);
  const [userList, setUserList] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  useEffect(() => {
    console.log("Current user in Chat Room", user?.uid)
    setCurrentUser(user?.uid ?? "");
    const fetchUsers = async () => {
      const db = getFirestore();
      const usersCol = collection(db, 'users');
      const userSnapshot = await getDocs(usersCol);
      const users: User[] = userSnapshot.docs.map(doc => ({
        userId: doc.id,
        name: doc.data().displayName,
        role: doc.data().role,
      })).filter(userx => userx.userId !== user?.uid);
      setUserList(users);
    };
    fetchUsers();
  }, [user]);

  useEffect(() => {
    if (userList.length > 0) {
      handleChange(userList[0].userId);
    }
  }, [userList]);

  function handleChange(userId: string){
    setSelectedUserId(userId)
    const ids = [currentUserId, userId!].sort((a, b) => b!.localeCompare(a!));
    setCurrentChatId(`${ids[0]}_${ids[1]}`);
    console.log("Chat ID", chatId)
  }
  return (
    <main>
      <h1>Chat</h1>
      <ul>
        {userList.map(user => (
            <li
            key={user.userId}
            className={`flex items-center px-4 py-3 border-b border-gray-200 cursor-pointer transition-colors ${
              selectedUserId === user.userId
              ? 'bg-blue-100'
              : 'hover:bg-gray-100'
            }`}
            onClick={() => handleChange(user.userId)}
            >
            <div className="flex-1">
              <div className="font-medium">{user.name}</div>
              <div className="text-xs text-gray-500">{user.role}</div>
            </div>
            </li>
        ))}
      </ul>
      {chatId ? <ChatWindow chatId={chatId} /> : <></>}
    </main>
  );
}
