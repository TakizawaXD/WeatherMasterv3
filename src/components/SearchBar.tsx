import React, { useState, useCallback } from 'react';
import { Search, MapPin, Globe } from 'lucide-react';

interface SearchBarProps {
  onSearch: (city: string) => void;
  loading?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch, loading = false }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  }, [query, onSearch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const popularCities = [
    'Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Bilbao',
    'Londres', 'París', 'Roma', 'Berlín', 'Ámsterdam'
  ];

  const handleCityClick = (city: string) => {
    setQuery(city);
    onSearch(city);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            {loading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            ) : (
              <Search size={24} className="text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            )}
          </div>
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            placeholder="Buscar ciudad... (ej: Madrid, Barcelona, Londres)"
            disabled={loading}
            className="w-full pl-14 pr-16 py-4 bg-white rounded-2xl border-2 border-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-lg placeholder-gray-400"
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-blue-500 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-110"
          >
            <div className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-xl transition-colors">
              <MapPin size={20} />
            </div>
          </button>
        </div>
      </form>

      {/* Ciudades Populares */}
      <div className="text-center">
        <p className="text-sm text-gray-600 mb-3 font-medium">
          <Globe size={16} className="inline mr-2" />
          Ciudades populares:
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {popularCities.map((city) => (
            <button
              key={city}
              onClick={() => handleCityClick(city)}
              disabled={loading}
              className="px-4 py-2 bg-white/80 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-lg text-sm font-medium text-gray-700 hover:text-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
            >
              {city}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};