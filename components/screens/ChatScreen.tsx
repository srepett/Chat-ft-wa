
import React, { useState, useCallback, useEffect } from 'react';
import { User } from '../../types';
import Sidebar from '../chat/Sidebar';
import ChatWindow from '../chat/ChatWindow';
import ProfileSettings from '../profile/ProfileSettings';

const WelcomePlaceholder: React.FC = () => (
    <div className="flex flex-col items-center justify-center h-full bg-dark-200 text-gray-400">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 mb-4"><path d="M17 9.5a9 9 0 1 0-11.42 7.06"/><path d="M12 1a3 3 0 0 0-3 3v1c0 1.66-1.34 3-3 3h-1c-1.1 0-2 .9-2 2v2c0 1.1.9 2 2 2h1c1.66 0 3 1.34 3 3v1c0 1.66 1.34 3 3 3s3-1.34 3-3v-1c0-1.66 1.34-3 3-3h1c1.1 0 2-.9 2-2v-2c0-1.1-.9-2-2-2h-1c-1.66 0-3-1.34-3-3V4c0-1.66-1.34-3-3-3z"/><path d="M12 5a3 3 0 0 0-3 3v1c0 1.66-1.34 3-3 3h-1"/></svg>
        <h2 className="text-2xl font-semibold">Welcome to React Chat</h2>
        <p>Select a chat to start messaging or find a new user.</p>
    </div>
);


const ChatScreen: React.FC = () => {
    const [activeChat, setActiveChat] = useState<User | null>(null);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [forceUpdate, setForceUpdate] = useState(0);

    const handleNewMessage = useCallback(() => {
        setForceUpdate(prev => prev + 1);
    }, []);

    const handleSelectChat = (user: User) => {
        setActiveChat(user);
    }
    
    return (
        <div className="flex h-screen w-screen bg-dark-100 text-white antialiased">
            <Sidebar 
              onSelectChat={handleSelectChat} 
              onOpenSettings={() => setIsSettingsOpen(true)}
              activeContactId={activeChat?.id}
              forceUpdate={forceUpdate}
            />
            <main className="flex-1 flex flex-col">
                {activeChat ? (
                    <ChatWindow contact={activeChat} onNewMessage={handleNewMessage} key={activeChat.id}/>
                ) : (
                    <WelcomePlaceholder />
                )}
            </main>

            {isSettingsOpen && (
                <ProfileSettings onClose={() => setIsSettingsOpen(false)} />
            )}
        </div>
    );
};

export default ChatScreen;
