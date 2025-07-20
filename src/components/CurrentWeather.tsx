import React from 'react';
import { WeatherData } from '../types/weather';
import { WeatherIcon } from './WeatherIcon';
import { 
  Thermometer, 
  Droplets, 
  Wind, 
  Eye, 
  Gauge,
  Navigation,
  Sunrise,
  Sunset,
  Activity
} from 'lucide-react';

interface CurrentWeatherProps {
  data: WeatherData;
  unit: 'celsius' | 'fahrenheit';
}

export const CurrentWeather: React.FC<CurrentWeatherProps> = ({ data, unit }) => {
  const convertTemp = (temp: number) => {
    if (unit === 'fahrenheit') {
      return Math.round((temp * 9/5) + 32);
    }
    return temp;
  };

  const getWindDirection = (degrees: number) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'O', 'NO'];
    return directions[Math.round(degrees / 45) % 8];
  };

  const getBackgroundGradient = () => {
    const condition = data.current.condition.toLowerCase();
    if (condition.includes('rain') || condition.includes('drizzle')) {
      return 'from-slate-600 via-slate-700 to-slate-800';
    }
    if (condition.includes('cloud')) {
      return 'from-gray-500 via-gray-600 to-gray-700';
    }
    if (condition.includes('snow')) {
      return 'from-blue-300 via-blue-400 to-blue-500';
    }
    if (condition.includes('clear')) {
      return 'from-blue-400 via-blue-500 to-blue-600';
    }
    return 'from-sky-400 via-sky-500 to-sky-600';
  };

  const getConditionInSpanish = (condition: string) => {
    const translations: { [key: string]: string } = {
      'clear': 'Despejado',
      'clouds': 'Nublado',
      'rain': 'Lluvia',
      'drizzle': 'Llovizna',
      'thunderstorm': 'Tormenta',
      'snow': 'Nieve',
      'mist': 'Niebla',
      'fog': 'Niebla',
      'haze': 'Bruma'
    };
    return translations[condition.toLowerCase()] || condition;
  };

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });
  };

  return (
    <div className={`bg-gradient-to-br ${getBackgroundGradient()} rounded-3xl p-8 text-white shadow-2xl transition-all duration-500 relative overflow-hidden`}>
      {/* Efectos de fondo */}
      <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-4xl font-bold mb-2">{data.location.name}</h2>
            <p className="text-xl opacity-90 mb-1">{data.location.country}</p>
            <p className="text-sm opacity-75">
              📍 {data.location.lat.toFixed(2)}°, {data.location.lon.toFixed(2)}°
            </p>
            <p className="text-sm opacity-75 mt-1">
              🕒 Actualizado: {getCurrentTime()}
            </p>
          </div>
          <div className="text-center">
            <WeatherIcon 
              icon={data.current.icon} 
              condition={data.current.condition}
              size={100}
              className="animate-pulse drop-shadow-lg"
            />
            <p className="text-sm opacity-80 mt-2">
              {getConditionInSpanish(data.current.condition)}
            </p>
          </div>
        </div>

        {/* Temperatura Principal */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-baseline">
            <span className="text-7xl font-light mr-2">
              {convertTemp(data.current.temperature)}°
            </span>
            <span className="text-2xl opacity-80">
              {unit === 'celsius' ? 'C' : 'F'}
            </span>
          </div>
          <div className="text-right">
            <p className="text-2xl capitalize mb-2">{data.current.description}</p>
            <p className="text-lg opacity-80">
              Sensación térmica: {convertTemp(data.current.feelsLike)}°{unit === 'celsius' ? 'C' : 'F'}
            </p>
          </div>
        </div>

        {/* Métricas Detalladas */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm border border-white/10 hover:bg-white/25 transition-all duration-300">
            <div className="flex items-center mb-3">
              <Thermometer size={20} className="mr-2 text-orange-300" />
              <span className="text-sm opacity-80">Sensación</span>
            </div>
            <span className="text-xl font-semibold">
              {convertTemp(data.current.feelsLike)}°
            </span>
          </div>

          <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm border border-white/10 hover:bg-white/25 transition-all duration-300">
            <div className="flex items-center mb-3">
              <Droplets size={20} className="mr-2 text-blue-300" />
              <span className="text-sm opacity-80">Humedad</span>
            </div>
            <span className="text-xl font-semibold">{data.current.humidity}%</span>
          </div>

          <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm border border-white/10 hover:bg-white/25 transition-all duration-300">
            <div className="flex items-center mb-3">
              <Wind size={20} className="mr-2 text-green-300" />
              <span className="text-sm opacity-80">Viento</span>
            </div>
            <span className="text-xl font-semibold">
              {data.current.windSpeed} km/h
            </span>
            <p className="text-xs opacity-70 mt-1">
              {getWindDirection(data.current.windDirection)}
            </p>
          </div>

          <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm border border-white/10 hover:bg-white/25 transition-all duration-300">
            <div className="flex items-center mb-3">
              <Eye size={20} className="mr-2 text-purple-300" />
              <span className="text-sm opacity-80">Visibilidad</span>
            </div>
            <span className="text-xl font-semibold">{data.current.visibility} km</span>
          </div>

          <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm border border-white/10 hover:bg-white/25 transition-all duration-300">
            <div className="flex items-center mb-3">
              <Gauge size={20} className="mr-2 text-yellow-300" />
              <span className="text-sm opacity-80">Presión</span>
            </div>
            <span className="text-xl font-semibold">{data.current.pressure}</span>
            <p className="text-xs opacity-70 mt-1">hPa</p>
          </div>

          <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm border border-white/10 hover:bg-white/25 transition-all duration-300">
            <div className="flex items-center mb-3">
              <Navigation size={20} className="mr-2 text-red-300" />
              <span className="text-sm opacity-80">Dirección</span>
            </div>
            <span className="text-xl font-semibold">{data.current.windDirection}°</span>
            <p className="text-xs opacity-70 mt-1">
              {getWindDirection(data.current.windDirection)}
            </p>
          </div>
        </div>

        {/* Información Adicional */}
        <div className="mt-6 p-4 bg-white/10 rounded-xl border border-white/20">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center">
              <Activity size={16} className="mr-2 text-green-300" />
              <span>Estado del aire: Bueno</span>
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
              <span>Datos actualizados</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};