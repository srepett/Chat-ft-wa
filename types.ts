
export interface User {
  id: string;
  serverId: string;
  username: string;
  email: string;
  passwordHash: string;
  profilePicture: string; // URL to image
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: number;
}

export interface Chat {
  contact: User;
  lastMessage: Message | null;
}
