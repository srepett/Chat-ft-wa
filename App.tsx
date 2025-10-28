
import React, { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import ChatScreen from './components/screens/ChatScreen';
import LoginScreen from './components/screens/LoginScreen';
import RegisterScreen from './components/screens/RegisterScreen';

function App() {
  const { user } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);

  if (user) {
    return <ChatScreen />;
  }

  return (
    <div className="min-h-screen bg-dark-100 flex items-center justify-center">
      {isRegistering ? (
        <RegisterScreen onSwitchToLogin={() => setIsRegistering(false)} />
      ) : (
        <LoginScreen onSwitchToRegister={() => setIsRegistering(true)} />
      )}
    </div>
  );
}

export default App;
