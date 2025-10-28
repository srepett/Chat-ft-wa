
import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

interface RegisterScreenProps {
  onSwitchToLogin: () => void;
}

const RegisterScreen: React.FC<RegisterScreenProps> = ({ onSwitchToLogin }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if(password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
    }
    try {
      const newUser = await register(username, email, password);
      if (!newUser) {
        setError('Username or email already exists.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-dark-200 rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold text-center text-primary">Create Account</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="username" className="text-sm font-medium text-gray-300">Username</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-full px-3 py-2 mt-1 text-gray-200 bg-dark-100 border border-dark-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label htmlFor="email" className="text-sm font-medium text-gray-300">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 mt-1 text-gray-200 bg-dark-100 border border-dark-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label htmlFor="password" className="text-sm font-medium text-gray-300">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-3 py-2 mt-1 text-gray-200 bg-dark-100 border border-dark-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button type="submit" className="w-full py-2 px-4 bg-primary text-dark-100 font-semibold rounded-md hover:bg-opacity-90 transition duration-300">
          Register
        </button>
      </form>
      <p className="text-sm text-center text-gray-400">
        Already have an account?{' '}
        <button onClick={onSwitchToLogin} className="font-medium text-primary hover:underline">
          Sign in
        </button>
      </p>
    </div>
  );
};

export default RegisterScreen;
