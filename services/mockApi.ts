import { User, Message, Chat } from '../types';

// Helper to simulate password hashing
const simpleHash = (s: string): string => {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return h.toString();
};

const getUsers = (): User[] => {
  const users = localStorage.getItem('chat_app_users');
  return users ? JSON.parse(users) : [];
};

const saveUsers = (users: User[]) => {
  localStorage.setItem('chat_app_users', JSON.stringify(users));
};

const getMessages = (): Record<string, Message[]> => {
    const messages = localStorage.getItem('chat_app_messages');
    return messages ? JSON.parse(messages) : {};
}

const saveMessages = (messages: Record<string, Message[]>) => {
    localStorage.setItem('chat_app_messages', JSON.stringify(messages));
}

export const registerUser = async (username: string, email: string, password: string): Promise<User | null> => {
  const users = getUsers();
  if (users.some(u => u.email === email || u.username.toLowerCase() === username.toLowerCase())) {
    return null; // User already exists
  }

  const newUser: User = {
    id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
    serverId: `${Math.floor(1000 + Math.random() * 9000)}`,
    username,
    email,
    passwordHash: simpleHash(password),
    profilePicture: `https://picsum.photos/seed/${username}/200`,
  };

  users.push(newUser);
  saveUsers(users);
  return newUser;
};

export const loginUser = async (email: string, password: string): Promise<User | null> => {
  const users = getUsers();
  const passwordHash = simpleHash(password);
  const user = users.find(u => u.email === email && u.passwordHash === passwordHash);
  return user || null;
};

export const findUsers = async (query: string, currentUserId: string): Promise<User[]> => {
  const users = getUsers();
  const lowercasedQuery = query.toLowerCase();
  return users.filter(u => 
    u.id !== currentUserId && (
      u.username.toLowerCase().includes(lowercasedQuery) ||
      u.id.includes(lowercasedQuery) ||
      u.serverId.includes(lowercasedQuery)
    )
  );
};

export const getUserById = async (userId: string): Promise<User | null> => {
    const users = getUsers();
    return users.find(u => u.id === userId) || null;
}

const getChatId = (userId1: string, userId2: string): string => {
    return [userId1, userId2].sort().join('__CHAT_WITH__');
}

export const getChatHistory = async (userId1: string, userId2:string): Promise<Message[]> => {
    const allMessages = getMessages();
    const chatId = getChatId(userId1, userId2);
    return allMessages[chatId] || [];
}

export const sendMessage = async (senderId: string, receiverId: string, text: string): Promise<Message> => {
    const allMessages = getMessages();
    const chatId = getChatId(senderId, receiverId);

    const newMessage: Message = {
        id: `msg-${Date.now()}`,
        senderId,
        receiverId,
        text,
        timestamp: Date.now(),
    };

    if (!allMessages[chatId]) {
        allMessages[chatId] = [];
    }
    allMessages[chatId].push(newMessage);
    saveMessages(allMessages);
    return newMessage;
}

export const getChatsForUser = async (userId: string): Promise<Chat[]> => {
    const allMessages = getMessages();
    const users = getUsers();
    const userContacts = new Set<string>();

    Object.keys(allMessages).forEach(chatId => {
        if (chatId.includes(userId)) {
            const ids = chatId.split('__CHAT_WITH__');
            if (ids.length === 2) {
              const [id1, id2] = ids;
              const contactId = id1 === userId ? id2 : id1;
              userContacts.add(contactId);
            }
        }
    });

    const chats: Chat[] = [];
    for (const contactId of userContacts) {
        const contact = users.find(u => u.id === contactId);
        if (contact) {
            const messages = await getChatHistory(userId, contactId);
            const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;
            chats.push({ contact, lastMessage });
        }
    }
    
    chats.sort((a, b) => (b.lastMessage?.timestamp || 0) - (a.lastMessage?.timestamp || 0));

    return chats;
}

export const updateUserInDb = (updatedUser: User): void => {
    let users = getUsers();
    users = users.map(u => u.id === updatedUser.id ? updatedUser : u);
    saveUsers(users);
}