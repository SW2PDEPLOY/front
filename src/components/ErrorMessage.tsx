import React from 'react';

interface ErrorMessageProps {
  message: string;
  onClose: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  onClose
}) => {
  return (
    <div className="bg-red-100 text-red-800 p-4 rounded-md fixed top-4 left-4 z-50 max-w-md">
      {message}
      <button
        className="absolute top-1 right-1 text-red-600 hover:text-red-900"
        onClick={onClose}
      >
        ×
      </button>
    </div>
  );
};
