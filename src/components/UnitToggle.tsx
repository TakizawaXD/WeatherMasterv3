import React from 'react';

interface UnitToggleProps {
  unit: 'celsius' | 'fahrenheit';
  onToggle: (unit: 'celsius' | 'fahrenheit') => void;
}

export const UnitToggle: React.FC<UnitToggleProps> = ({ unit, onToggle }) => {
  return (
    <div className="flex items-center bg-white rounded-lg shadow-md p-1">
      <button
        onClick={() => onToggle('celsius')}
        className={`px-3 py-2 rounded-md transition-all duration-200 ${
          unit === 'celsius'
            ? 'bg-blue-500 text-white shadow-sm'
            : 'text-gray-600 hover:text-gray-800'
        }`}
      >
        °C
      </button>
      <button
        onClick={() => onToggle('fahrenheit')}
        className={`px-3 py-2 rounded-md transition-all duration-200 ${
          unit === 'fahrenheit'
            ? 'bg-blue-500 text-white shadow-sm'
            : 'text-gray-600 hover:text-gray-800'
        }`}
      >
        °F
      </button>
    </div>
  );
};