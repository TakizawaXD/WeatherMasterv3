import React, { useState, useEffect } from 'react';
import { SearchBar } from './components/SearchBar';
import { CurrentWeather } from './components/CurrentWeather';
import { ForecastCard } from './components/ForecastCard';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorMessage } from './components/ErrorMessage';
import { UnitToggle } from './components/UnitToggle';
import { useWeather } from './hooks/useWeather';
import { Cloud, Github, Shield, Zap, Globe } from 'lucide-react';

function App() {
  const { data, loading, error, fetchWeather, clearError } = useWeather();
  const [unit, setUnit] = useState<'celsius' | 'fahrenheit'>('celsius');

  // Cargar ciudad por defecto al iniciar la app
  useEffect(() => {
    fetchWeather('Madrid');
  }, [fetchWeather]);

  const handleSearch = (city: string) => {
    clearError();
    fetchWeather(city);
  };

  const handleRetry = () => {
    if (data?.location.name) {
      fetchWeather(data.location.name);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md shadow-lg sticky top-0 z-50 border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 p-3 rounded-xl shadow-lg">
                <Cloud size={36} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  WeatherMaster
                </h1>
                <p className="text-sm text-gray-600 font-medium">
                  Clima en tiempo real mundial
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 bg-green-50 px-3 py-2 rounded-lg border border-green-200">
                <Shield size={16} className="text-green-600" />
                <span className="text-xs font-medium text-green-700">Seguro</span>
              </div>
              <UnitToggle unit={unit} onToggle={setUnit} />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-12">
          <div className="text-center mb-10">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Pronóstico del Tiempo
              <span className="block text-2xl md:text-3xl text-blue-600 mt-2">
                Para Cualquier Ciudad del Mundo
              </span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
              Obtén información meteorológica precisa y actualizada con pronósticos de 5 días,
              datos en tiempo real y una interfaz moderna y responsiva.
            </p>
            <SearchBar onSearch={handleSearch} loading={loading} />
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 p-3 rounded-lg mr-4">
                  <Zap size={24} className="text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Tiempo Real</h3>
              </div>
              <p className="text-gray-600">
                Datos meteorológicos actualizados cada 15 minutos con caché inteligente
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center mb-4">
                <div className="bg-green-100 p-3 rounded-lg mr-4">
                  <Globe size={24} className="text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Global</h3>
              </div>
              <p className="text-gray-600">
                Acceso a información meteorológica de más de 200,000 ciudades mundiales
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center mb-4">
                <div className="bg-purple-100 p-3 rounded-lg mr-4">
                  <Shield size={24} className="text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Seguro</h3>
              </div>
              <p className="text-gray-600">
                Conexiones HTTPS seguras y protección de datos personales
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 pb-12">
        {/* Estado de la API */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 mb-8 shadow-lg">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse"></div>
            <div className="flex-1">
              <p className="font-semibold text-green-800 mb-1">
                🌐 API Conectada - OpenWeatherMap
              </p>
              <p className="text-sm text-green-700">
                WeatherMaster está conectado y listo para proporcionar datos meteorológicos 
                precisos y actualizados para cualquier ciudad del mundo.
              </p>
            </div>
            <div className="hidden md:block bg-green-100 px-4 py-2 rounded-lg">
              <span className="text-xs font-medium text-green-700">
                ✓ Caché: 15 min
              </span>
            </div>
          </div>
        </div>

        {/* Contenido Principal */}
        {loading && <LoadingSpinner />}
        
        {error && (
          <ErrorMessage 
            message={error} 
            onRetry={handleRetry}
          />
        )}

        {data && !loading && (
          <div className="space-y-10">
            {/* Clima Actual */}
            <section>
              <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                Condiciones Actuales
              </h3>
              <CurrentWeather data={data} unit={unit} />
            </section>

            {/* Pronóstico de 5 Días */}
            <section>
              <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                Pronóstico Extendido - 5 Días
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                {data.forecast.map((day, index) => (
                  <ForecastCard 
                    key={`${day.date}-${index}`}
                    forecast={day} 
                    unit={unit}
                  />
                ))}
              </div>
            </section>
          </div>
        )}

        {/* Información Técnica */}
        <section className="mt-16">
          <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              Especificaciones Técnicas
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-600">API</span>
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">OpenWeatherMap</h4>
                <p className="text-sm text-gray-600">Datos meteorológicos profesionales</p>
              </div>
              
              <div className="text-center">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-green-600">⚡</span>
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">Caché Inteligente</h4>
                <p className="text-sm text-gray-600">15 minutos de optimización</p>
              </div>
              
              <div className="text-center">
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-purple-600">🔒</span>
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">Seguridad HTTPS</h4>
                <p className="text-sm text-gray-600">Conexiones encriptadas</p>
              </div>
              
              <div className="text-center">
                <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-orange-600">📱</span>
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">Responsivo</h4>
                <p className="text-sm text-gray-600">Todos los dispositivos</p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-16">
          <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-8 text-white shadow-2xl">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-4 mb-6">
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-xl">
                  <Cloud size={32} className="text-white" />
                </div>
                <div>
                  <h4 className="text-2xl font-bold">WeatherMaster</h4>
                  <p className="text-gray-300">Aplicación Meteorológica Profesional</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                  <h5 className="font-semibold mb-2">Tecnología</h5>
                  <p className="text-sm text-gray-300">React 18 + TypeScript + Tailwind CSS</p>
                </div>
                <div>
                  <h5 className="font-semibold mb-2">Datos</h5>
                  <p className="text-sm text-gray-300">OpenWeatherMap API Profesional</p>
                </div>
                <div>
                  <h5 className="font-semibold mb-2">Despliegue</h5>
                  <p className="text-sm text-gray-300">AWS + Netlify Ready</p>
                </div>
              </div>
              
              <div className="border-t border-gray-700 pt-6">
                <p className="text-sm text-gray-400">
                  © 2025 WeatherMaster. Aplicación meteorológica de código abierto.
                </p>
                <div className="flex items-center justify-center mt-2 space-x-4">
                  <Github size={20} className="text-gray-400 hover:text-white transition-colors cursor-pointer" />
                  <span className="text-xs text-gray-500">Construido con ❤️ para desarrolladores</span>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default App;