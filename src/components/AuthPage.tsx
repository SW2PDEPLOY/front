import React, { useState, useEffect } from 'react';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { authApi } from '../services/apiService';

interface AuthPageProps {
  onSuccess: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);

  // Check if user is already authenticated
  useEffect(() => {
    if (authApi.isAuthenticated()) {
      onSuccess();
    }
  }, [onSuccess]);

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {isLogin ? (
          <LoginForm
            onSuccess={onSuccess}
            onRegisterClick={toggleAuthMode}
          />
        ) : (
          <RegisterForm
            onSuccess={onSuccess}
            onLoginClick={toggleAuthMode}
          />
        )}
      </div>
    </div>
  );
};
