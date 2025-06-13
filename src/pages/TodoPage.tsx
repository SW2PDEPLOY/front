import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TodoList } from '../components/TodoList';

export const TodoPage: React.FC = () => {
  const navigate = useNavigate();
  
  const handleGoHome = () => {
    navigate('/');
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-indigo-600 text-white p-4 flex justify-between items-center">
        <h1 className="text-lg font-semibold">Todo App</h1>
        <div className="flex gap-2">
          <button
            onClick={handleGoHome}
            className="px-4 py-2 bg-white text-indigo-700 rounded-md hover:bg-gray-100"
          >
            Back to Home
          </button>
        </div>
      </div>
      <TodoList />
    </div>
  );
}; 