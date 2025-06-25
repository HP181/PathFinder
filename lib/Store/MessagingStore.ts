import { create } from 'zustand';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  DocumentData,
  QueryDocumentSnapshot 
} from 'firebase/firestore';
import { db } from '../Firebase/Config';

interface Message {
  id?: string;
  conversationId: string;
  senderId: string;
  content: string;
  timestamp: any;
  read: boolean;
}

interface Conversation {
  id: string;
  participants: string[];
  lastMessage?: string;
  lastMessageTimestamp?: any;
  lastMessageSenderId?: string;
  unreadCount?: number;
}

interface MessagingState {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  messages: Message[];
  isLoading: boolean;
  loadConversations: (userId: string) => void;
  loadMessages: (conversationId: string) => void;
  sendMessage: (message: Omit<Message, 'id' | 'timestamp'>) => Promise<void>;
  createConversation: (participants: string[]) => Promise<string>;
  selectConversation: (conversation: Conversation | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  unsubscribeConversations: () => void;
  unsubscribeMessages: () => void;
}

export const useMessagingStore = create<MessagingState>((set, get) => {
  let conversationsUnsubscribe: (() => void) | null = null;
  let messagesUnsubscribe: (() => void) | null = null;
  
  return {
    conversations: [],
    selectedConversation: null,
    messages: [],
    isLoading: false,
    
    loadConversations: (userId: string) => {
      set({ isLoading: true });
      
      try {
        // Unsubscribe from previous listener if exists
        if (conversationsUnsubscribe) {
          conversationsUnsubscribe();
        }
        
        const conversationsQuery = query(
          collection(db, 'conversations'),
          where('participants', 'array-contains', userId)
        );
        
        conversationsUnsubscribe = onSnapshot(conversationsQuery, (snapshot) => {
          const conversations: Conversation[] = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          } as Conversation));
          
          set({ conversations, isLoading: false });
        });
      } catch (error) {
        console.error('Error loading conversations:', error);
        set({ isLoading: false });
      }
    },
    
    loadMessages: (conversationId: string) => {
      set({ isLoading: true });
      
      try {
        // Unsubscribe from previous listener if exists
        if (messagesUnsubscribe) {
          messagesUnsubscribe();
        }
        
        const messagesQuery = query(
          collection(db, 'messages'),
          where('conversationId', '==', conversationId),
          orderBy('timestamp', 'asc')
        );
        
        messagesUnsubscribe = onSnapshot(messagesQuery, (snapshot) => {
          const messages: Message[] = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          } as Message));
          
          set({ messages, isLoading: false });
        });
      } catch (error) {
        console.error('Error loading messages:', error);
        set({ isLoading: false });
      }
    },
    
    sendMessage: async (message: Omit<Message, 'id' | 'timestamp'>) => {
      try {
        // Add the message to Firestore
        await addDoc(collection(db, 'messages'), {
          ...message,
          timestamp: serverTimestamp(),
          read: false,
        });
        
        // Update the conversation with the last message
        const conversationRef = collection(db, 'conversations');
        await addDoc(conversationRef, {
          id: message.conversationId,
          lastMessage: message.content,
          lastMessageTimestamp: serverTimestamp(),
          lastMessageSenderId: message.senderId,
        });
      } catch (error) {
        console.error('Error sending message:', error);
        throw error;
      }
    },
    
    createConversation: async (participants: string[]) => {
      try {
        // Create a new conversation
        const conversationRef = await addDoc(collection(db, 'conversations'), {
          participants,
          createdAt: serverTimestamp(),
        });
        
        return conversationRef.id;
      } catch (error) {
        console.error('Error creating conversation:', error);
        throw error;
      }
    },
    
    selectConversation: (conversation: Conversation | null) => set({ selectedConversation: conversation }),
    setIsLoading: (isLoading: boolean) => set({ isLoading }),
    
    unsubscribeConversations: () => {
      if (conversationsUnsubscribe) {
        conversationsUnsubscribe();
        conversationsUnsubscribe = null;
      }
    },
    
    unsubscribeMessages: () => {
      if (messagesUnsubscribe) {
        messagesUnsubscribe();
        messagesUnsubscribe = null;
      }
    },
  };
});