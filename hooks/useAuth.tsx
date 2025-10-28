
import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import { User } from '../types';
import * as api from '../services/mockApi';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<User | null>;
  logout: () => void;
  register: (username: string, email: string, password: string) => Promise<User | null>;
  updateUser: (updatedUser: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLoggedInUser = () => {
      try {
        const storedUser = sessionStorage.getItem('chat_app_current_user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Failed to parse user from session storage", error);
        sessionStorage.removeItem('chat_app_current_user');
      } finally {
        setLoading(false);
      }
    };
    checkLoggedInUser();
  }, []);

  const login = async (email: string, password: string): Promise<User | null> => {
    const loggedInUser = await api.loginUser(email, password);
    if (loggedInUser) {
      setUser(loggedInUser);
      sessionStorage.setItem('chat_app_current_user', JSON.stringify(loggedInUser));
    }
    return loggedInUser;
  };

  const register = async (username: string, email: string, password: string): Promise<User | null> => {
    const newUser = await api.registerUser(username, email, password);
    if (newUser) {
      setUser(newUser);
      sessionStorage.setItem('chat_app_current_user', JSON.stringify(newUser));
    }
    return newUser;
  };
  
  const logout = useCallback(() => {
    setUser(null);
    sessionStorage.removeItem('chat_app_current_user');
  }, []);

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    sessionStorage.setItem('chat_app_current_user', JSON.stringify(updatedUser));
    api.updateUserInDb(updatedUser);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-100 flex items-center justify-center">
        <div className="text-primary text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, register, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
