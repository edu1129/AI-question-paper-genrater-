
import React from 'react';
import { FaTimesCircle, FaInfoCircle, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';

interface AlertProps {
  message: string;
  type: 'error' | 'success' | 'warning' | 'info';
  onClose?: () => void;
  persistent?: boolean;
}

export const Alert: React.FC<AlertProps> = ({ message, type, onClose, persistent = false }) => {
  let bgColor, textColor, Icon;

  switch (type) {
    case 'error':
      bgColor = 'bg-red-700/90 backdrop-blur-sm';
      textColor = 'text-red-100';
      Icon = FaTimesCircle;
      break;
    case 'success':
      bgColor = 'bg-green-700/90 backdrop-blur-sm';
      textColor = 'text-green-100';
      Icon = FaCheckCircle;
      break;
    case 'warning':
      bgColor = 'bg-yellow-600/90 backdrop-blur-sm';
      textColor = 'text-yellow-100';
      Icon = FaExclamationTriangle;
      break;
    default: // info
      bgColor = 'bg-sky-700/90 backdrop-blur-sm';
      textColor = 'text-sky-100';
      Icon = FaInfoCircle;
      break;
  }

  if (!message) return null;

  return (
    <div className={`fixed top-20 left-1/2 transform -translate-x-1/2 z-50 w-11/12 md:w-1/2 max-w-lg p-4 rounded-md shadow-lg flex items-start ${bgColor} ${textColor} transition-opacity duration-300`} role="alert">
      <div className="flex-shrink-0 mr-3">
        <Icon size={20} />
      </div>
      <div className="flex-grow">
        <p className="font-medium">{type.charAt(0).toUpperCase() + type.slice(1)}</p>
        <p className="text-sm">{message}</p>
      </div>
      {!persistent && onClose && (
        <button onClick={onClose} className="ml-auto -mx-1.5 -my-1.5 p-1.5 rounded-lg focus:ring-2 focus:ring-opacity-50 inline-flex h-8 w-8" aria-label="Dismiss">
          <FaTimesCircle size={18} />
        </button>
      )}
    </div>
  );
};
    