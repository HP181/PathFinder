"use client"
import { ChatWindow } from '@/components/chat/ChatWindow';
import { useEffect, useState } from 'react';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { useAuthStore } from '@/lib/Store/Auth-Store';

export default function ChatPage() {
  const [chatId, setCurrentChatId] = useState<string | null>(null);

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
    setCurrentUser(user?.uid ?? "");
    const fetchUsers = async () => {
      const db = getFirestore();
      const usersCol = collection(db, 'users');
      const userSnapshot = await getDocs(usersCol);

          // Fetch mentor UIDs from 'matches' where immigrantUid == current user id
          const matchesCol = collection(db, 'matches');
          const matchesSnapshot = await getDocs(matchesCol);
          const mentorUids: string[] = matchesSnapshot.docs
            .filter(doc => doc.data().immigrantUid === user?.uid)
            .map(doc => doc.data().mentorUid);


            
          // Only include users who are mentors in the matches
          const users: User[] = userSnapshot.docs
            .filter(doc => mentorUids.includes(doc.id))
            .map(doc => ({
              userId: doc.id,
              name: doc.data().displayName,
              role: doc.data().role,
            }));

      // const users: User[] = userSnapshot.docs.map(doc => ({
      //   userId: doc.id,
      //   name: doc.data().displayName,
      //   role: doc.data().role,
      // })).filter(userx => userx.userId !== user?.uid);
      setUserList(users);
    };
    fetchUsers();
  }, [user]);

  useEffect(() => {
    if (userList.length > 0) {
      handleChange(userList[0].userId);
    }
  }, [userList]);

  function handleChange(userId: string) {
    setSelectedUserId(userId);
    const ids = [currentUserId, userId].sort((a, b) => b!.localeCompare(a!));
    setCurrentChatId(`${ids[0]}_${ids[1]}`);
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-6 flex flex-col items-center">
      <h1 className="text-3xl md:text-4xl font-bold text-white mb-6">💬 Chat</h1>

      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-6">
        <aside className="col-span-1 glass p-4 rounded-2xl shadow-lg backdrop-blur-lg">
          <h2 className="text-white text-lg font-semibold mb-3">Users</h2>
          <ul className="space-y-2">
            {userList.map((user) => (
              <li
                key={user.userId}
                className={`flex items-center px-3 py-2 rounded-lg cursor-pointer transition 
                  ${selectedUserId === user.userId 
                    ? 'bg-white/20 border border-white/30' 
                    : 'hover:bg-white/10'}`
                }
                onClick={() => handleChange(user.userId)}
              >
                <div className="flex-1">
                  <div className="text-white font-medium">{user.name}</div>
                  <div className="text-xs text-white/70">{user.role}</div>
                </div>
              </li>
            ))}
          </ul>
        </aside>

        <section className="col-span-2 glass rounded-2xl shadow-lg backdrop-blur-lg p-4">
          {chatId ? (
            <ChatWindow chatId={chatId} />
          ) : (
            <div className="text-white/70 text-center mt-10">Select a user to start chatting</div>
          )}
        </section>
      </div>
    </main>
  );
}
