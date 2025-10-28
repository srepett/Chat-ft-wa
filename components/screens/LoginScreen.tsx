
import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

interface LoginScreenProps {
  onSwitchToRegister: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const user = await login(email, password);
      if (!user) {
        setError('Invalid email or password.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-dark-200 rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold text-center text-primary">Sign In</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
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
          Login
        </button>
      </form>
      <p className="text-sm text-center text-gray-400">
        Don't have an account?{' '}
        <button onClick={onSwitchToRegister} className="font-medium text-primary hover:underline">
          Sign up
        </button>
      </p>
    </div>
  );
};

export default LoginScreen;
