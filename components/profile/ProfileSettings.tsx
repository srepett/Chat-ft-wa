
import React, { useState, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';

interface ProfileSettingsProps {
    onClose: () => void;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ onClose }) => {
    const { user, logout, updateUser } = useAuth();
    const [newUsername, setNewUsername] = useState(user?.username || '');
    const [isEditing, setIsEditing] = useState(false);
    const [feedback, setFeedback] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!user) return null;

    const handleUpdateUsername = () => {
        if (newUsername.trim() === '' || newUsername.trim() === user.username) {
            setIsEditing(false);
            return;
        }
        
        const updatedUser = { ...user, username: newUsername.trim() };
        updateUser(updatedUser);
        setFeedback('Username updated successfully!');
        setIsEditing(false);
        setTimeout(() => setFeedback(''), 2000);
    };

    const handleIdCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setFeedback('Copied to clipboard!');
        setTimeout(() => setFeedback(''), 2000);
    }

    const handleProfilePictureClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setFeedback('Please select a valid image file (PNG, JPG, GIF).');
            setTimeout(() => setFeedback(''), 3000);
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            if (typeof reader.result === 'string') {
                const updatedUser = { ...user, profilePicture: reader.result };
                updateUser(updatedUser);
                setFeedback('Profile picture updated!');
                setTimeout(() => setFeedback(''), 2000);
            }
        };
        reader.readAsDataURL(file);
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-dark-200 rounded-lg shadow-xl w-full max-w-md p-6 m-4" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-primary">Profile & Settings</h2>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-dark-300 hover:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>

                <div className="flex flex-col items-center mb-6">
                    <div className="relative group cursor-pointer" onClick={handleProfilePictureClick}>
                        <img src={user.profilePicture} alt={user.username} className="w-24 h-24 rounded-full border-4 border-primary object-cover" />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 rounded-full flex items-center justify-center transition-opacity duration-300">
                             <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
                        </div>
                    </div>
                     <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/png, image/jpeg, image/gif"
                    />

                     {isEditing ? (
                        <div className="flex items-center space-x-2 mt-4">
                           <input 
                                type="text" 
                                value={newUsername} 
                                onChange={(e) => setNewUsername(e.target.value)}
                                className="text-lg bg-dark-100 px-2 py-1 rounded border border-dark-300 focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                            <button onClick={handleUpdateUsername} className="text-green-400 hover:text-green-300">Save</button>
                            <button onClick={() => setIsEditing(false)} className="text-red-400 hover:text-red-300">Cancel</button>
                        </div>
                    ) : (
                        <div className="flex items-center space-x-2 mt-4">
                            <h3 className="text-xl font-semibold">{user.username}</h3>
                            <button onClick={() => setIsEditing(true)} className="text-gray-400 hover:text-primary">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                            </button>
                        </div>
                    )}
                    <p className="text-sm text-gray-400 mt-1">{user.email}</p>
                </div>
                
                <div className="space-y-3 bg-dark-100 p-4 rounded-md">
                    <p className="text-gray-300">Your unique ID (click to copy):</p>
                    <div onClick={() => handleIdCopy(`${user.serverId}-${user.id.slice(-6)}`)}
                         className="bg-dark-300 p-2 rounded text-center font-mono cursor-pointer hover:bg-dark-400 transition-colors">
                        <span className="text-primary font-bold">#{user.serverId}</span>:<span className="text-gray-200">{user.id.slice(-6)}</span>
                    </div>
                </div>

                {feedback && <p className="text-center text-green-400 mt-4 text-sm">{feedback}</p>}

                <div className="mt-8 pt-6 border-t border-dark-300">
                    <button onClick={logout} className="w-full py-2 px-4 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 transition duration-300">
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProfileSettings;
