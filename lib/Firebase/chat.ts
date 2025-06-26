import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  doc,
  setDoc,
  getDoc
} from 'firebase/firestore';
import { db } from '@/lib/Firebase/Config';

export const sendMessage = async (chatId: string, senderId: string, text: string) => {
  const messageRef = collection(db, 'chats', chatId, 'messages');
  await addDoc(messageRef, {
    senderId,
    text,
    createdAt: serverTimestamp()
  });
};

export const listenToMessages = (chatId: string, callback: Function) => {
  const q = query(collection(db, 'chats', chatId, 'messages'), orderBy('createdAt'));
  return onSnapshot(q, snapshot => {
    const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(messages);
  });
};
