import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  containerClassName?: string;
}

export const Select: React.FC<SelectProps> = ({ label, id, error, options, className = '', containerClassName = '', ...props }) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  // Custom chevron arrow for a unique and consistent look
  const chevronSvg = `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`;

  const baseClasses = 'block w-full appearance-none bg-no-repeat bg-right-2.5 bg-center text-base text-gray-900 bg-white border rounded-md py-2 pl-3 pr-10 focus:outline-none transition duration-150 ease-in-out disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed';

  const stateClasses = error
    ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
    : 'border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500';

  return (
    <div className={`mb-4 ${containerClassName}`}>
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`${baseClasses} ${stateClasses} ${className}`}
        style={{
          backgroundImage: chevronSvg,
          backgroundSize: '1.5em 1.5em',
        }}
        {...props}
      >
        <option value="">Select {label || 'an option'}</option>
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};