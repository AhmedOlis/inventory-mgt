import React, { useState } from 'react';
import { ICONS } from '../../constants';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  containerClassName?: string;
}

export const Input: React.FC<InputProps> = ({ label, id, error, className = '', containerClassName = '', type, ...props }) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  const isPasswordInput = type === 'password';
  const currentType = isPasswordInput ? (isPasswordVisible ? 'text' : 'password') : type;

  const baseClasses = 'block w-full text-base text-gray-900 placeholder-gray-400 bg-white border rounded-md py-2 px-3 focus:outline-none transition duration-150 ease-in-out disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed';

  const stateClasses = error
    ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
    : 'border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500';
  
  const paddingClass = isPasswordInput ? 'pr-10' : '';

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(prev => !prev);
  };

  return (
    <div className={`mb-4 ${containerClassName}`}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={inputId}
          type={currentType}
          className={`${baseClasses} ${stateClasses} ${paddingClass} ${className}`}
          {...props}
        />
        {isPasswordInput && (
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
            aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
          >
            {isPasswordVisible ? ICONS.eyeSlash : ICONS.eye}
          </button>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};