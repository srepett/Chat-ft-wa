import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { User, Message } from '../../types';
import * as api from '../../services/mockApi';

interface ChatWindowProps {
    contact: User;
    onNewMessage: () => void;
}

const MessageBubble: React.FC<{ message: Message, isSender: boolean }> = ({ message, isSender }) => {
    return (
        <div className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-2xl ${isSender ? 'bg-primary text-dark-100 rounded-br-none' : 'bg-dark-300 rounded-bl-none'}`}>
                <p>{message.text}</p>
                <p className={`text-xs mt-1 text-right ${isSender ? 'text-gray-800' : 'text-gray-400'}`}>
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
            </div>
        </div>
    );
};


const ChatWindow: React.FC<ChatWindowProps> = ({ contact, onNewMessage }) => {
    const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
    
    useEffect(() => {
        const fetchMessages = async () => {
            if (user) {
                const history = await api.getChatHistory(user.id, contact.id);
                setMessages(history);
            }
        };

        fetchMessages(); // Initial fetch

        const intervalId = setInterval(async () => {
            if (user) {
                const history = await api.getChatHistory(user.id, contact.id);
                setMessages(currentMessages => {
                    return history.length > currentMessages.length ? history : currentMessages;
                });
            }
        }, 1000); // Poll every second for new messages

        return () => clearInterval(intervalId);
    }, [user, contact.id]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim() === '' || !user) return;

        const sentMessage = await api.sendMessage(user.id, contact.id, newMessage);
        setMessages(prev => [...prev, sentMessage]);
        setNewMessage('');
        onNewMessage();
    };

    if (!user) return null;

    return (
        <div className="flex flex-col h-full bg-dark-200">
            <header className="flex items-center p-4 bg-dark-100 border-b border-dark-300 shadow-sm">
                <img src={contact.profilePicture} alt={contact.username} className="w-10 h-10 rounded-full mr-4" />
                <h2 className="text-xl font-semibold">{contact.username}</h2>
            </header>
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {messages.map(msg => (
                    <MessageBubble key={msg.id} message={msg} isSender={msg.senderId === user.id} />
                ))}
                <div ref={messagesEndRef} />
            </div>
            <div className="p-4 bg-dark-100 border-t border-dark-300">
                <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 bg-dark-300 px-4 py-2 rounded-full border border-dark-300 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <button type="submit" className="bg-primary p-3 rounded-full text-dark-100 hover:bg-opacity-90 transition-transform duration-200 active:scale-90">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatWindow;