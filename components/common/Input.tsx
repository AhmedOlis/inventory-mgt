import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  containerClassName?: string;
}

export const Input: React.FC<InputProps> = ({ label, id, error, className = '', containerClassName = '', ...props }) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  const baseClasses = 'block w-full text-base text-gray-900 placeholder-gray-400 bg-white border rounded-md py-2 px-3 focus:outline-none transition duration-150 ease-in-out disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed';

  const stateClasses = error
    ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
    : 'border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500';

  return (
    <div className={`mb-4 ${containerClassName}`}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`${baseClasses} ${stateClasses} ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};