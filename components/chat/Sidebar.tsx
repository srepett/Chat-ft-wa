import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { User, Chat } from '../../types';
import * as api from '../../services/mockApi';

interface SidebarProps {
    onSelectChat: (user: User) => void;
    onOpenSettings: () => void;
    activeContactId?: string;
    forceUpdate: number;
}

const UserSearch: React.FC<{ onSelectUser: (user: User) => void }> = ({ onSelectUser }) => {
    const { user } = useAuth();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<User[]>([]);
    const [isFocused, setIsFocused] = useState(false);

    useEffect(() => {
        if (query.trim() === '') {
            setResults([]);
            return;
        }
        
        const fetchUsers = async () => {
            if (user) {
                const foundUsers = await api.findUsers(query, user.id);
                setResults(foundUsers);
            }
        };
        const debounce = setTimeout(fetchUsers, 300);
        return () => clearTimeout(debounce);
    }, [query, user]);

    const handleSelect = (user: User) => {
        onSelectUser(user);
        setQuery('');
        setResults([]);
        setIsFocused(false);
    }

    return (
        <div className="p-4 border-b border-dark-300 relative">
            <input
                type="text"
                placeholder="Find user by ID, server, name"
                className="w-full bg-dark-100 px-3 py-2 rounded-md border border-dark-300 focus:outline-none focus:ring-2 focus:ring-primary"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            />
            {isFocused && results.length > 0 && (
                <div className="absolute top-full left-0 right-0 z-10 bg-dark-200 border border-dark-300 rounded-b-md mt-1 max-h-60 overflow-y-auto">
                    {results.map(result => (
                        <div key={result.id} onClick={() => handleSelect(result)} className="flex items-center p-3 hover:bg-dark-400 cursor-pointer">
                            <img src={result.profilePicture} alt={result.username} className="w-10 h-10 rounded-full mr-3" />
                            <div>
                                <p className="font-semibold">{result.username}</p>
                                <p className="text-xs text-gray-400">#{result.serverId}:{result.id.slice(-6)}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const ChatList: React.FC<{ onSelectChat: (user: User) => void; activeContactId?: string, forceUpdate: number }> = ({ onSelectChat, activeContactId, forceUpdate }) => {
    const [chats, setChats] = useState<Chat[]>([]);
    const { user } = useAuth();

    // Effect for initial fetch and for "forced" updates when we send a message
    useEffect(() => {
        if (user) {
            api.getChatsForUser(user.id).then(setChats);
        }
    }, [user, forceUpdate]);

    // Effect for polling to receive messages from other users
    useEffect(() => {
        if (!user) return;
        
        const intervalId = setInterval(async () => {
            const userChats = await api.getChatsForUser(user.id);
            setChats(currentChats => {
                if (userChats.length !== currentChats.length ||
                    (userChats.length > 0 && currentChats.length > 0 && userChats[0].lastMessage?.id !== currentChats[0].lastMessage?.id)) {
                    return userChats;
                }
                return currentChats;
            });
        }, 3000); // Poll every 3 seconds

        return () => clearInterval(intervalId);
    }, [user]);

    return (
        <div className="flex-1 overflow-y-auto">
            {chats.length > 0 ? chats.map(({ contact, lastMessage }) => (
                <div key={contact.id}
                     onClick={() => onSelectChat(contact)}
                     className={`flex items-center p-3 cursor-pointer transition-colors duration-200 ${activeContactId === contact.id ? 'bg-primary bg-opacity-20' : 'hover:bg-dark-400'}`}>
                    <img src={contact.profilePicture} alt={contact.username} className="w-12 h-12 rounded-full mr-4" />
                    <div className="flex-1 overflow-hidden">
                        <p className="font-semibold">{contact.username}</p>
                        <p className="text-sm text-gray-400 truncate">{lastMessage ? lastMessage.text : 'No messages yet'}</p>
                    </div>
                </div>
            )) : <p className="text-center text-gray-500 p-4">No active chats. Find a user to start a conversation.</p>}
        </div>
    );
}

const Sidebar: React.FC<SidebarProps> = ({ onSelectChat, onOpenSettings, activeContactId, forceUpdate }) => {
    const { user } = useAuth();

    if (!user) return null;

    return (
        <aside className="w-full md:w-1/3 lg:w-1/4 bg-dark-200 flex flex-col border-r border-dark-300">
            <header className="flex items-center justify-between p-4 border-b border-dark-300">
                <div className="flex items-center">
                    <img src={user.profilePicture} alt={user.username} className="w-10 h-10 rounded-full mr-3" />
                    <h1 className="text-xl font-bold">{user.username}</h1>
                </div>
                <button onClick={onOpenSettings} className="p-2 rounded-full hover:bg-dark-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                </button>
            </header>
            <UserSearch onSelectUser={onSelectChat} />
            <ChatList onSelectChat={onSelectChat} activeContactId={activeContactId} forceUpdate={forceUpdate} />
        </aside>
    );
};

export default Sidebar;