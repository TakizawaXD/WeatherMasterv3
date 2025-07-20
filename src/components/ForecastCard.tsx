import React from 'react';
import { ForecastDay } from '../types/weather';
import { WeatherIcon } from './WeatherIcon';
import { Droplets, Wind, Thermometer, CloudRain } from 'lucide-react';

interface ForecastCardProps {
  forecast: ForecastDay;
  unit: 'celsius' | 'fahrenheit';
}

export const ForecastCard: React.FC<ForecastCardProps> = ({ forecast, unit }) => {
  const convertTemp = (temp: number) => {
    if (unit === 'fahrenheit') {
      return Math.round((temp * 9/5) + 32);
    }
    return temp;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Hoy';
    }
    if (date.toDateString() === tomorrow.toDateString()) {
      return 'Mañana';
    }
    
    return date.toLocaleDateString('es-ES', { 
      weekday: 'short', 
      day: 'numeric',
      month: 'short'
    });
  };

  const getConditionInSpanish = (condition: string) => {
    const translations: { [key: string]: string } = {
      'clear sky': 'Cielo despejado',
      'few clouds': 'Pocas nubes',
      'scattered clouds': 'Nubes dispersas',
      'broken clouds': 'Muy nublado',
      'shower rain': 'Chubascos',
      'rain': 'Lluvia',
      'thunderstorm': 'Tormenta',
      'snow': 'Nieve',
      'mist': 'Niebla',
      'light rain': 'Lluvia ligera',
      'moderate rain': 'Lluvia moderada',
      'heavy rain': 'Lluvia intensa',
      'overcast clouds': 'Cielo cubierto'
    };
    return translations[condition.toLowerCase()] || condition;
  };

  const getCardGradient = () => {
    const condition = forecast.condition.toLowerCase();
    if (condition.includes('rain') || condition.includes('drizzle')) {
      return 'from-blue-50 to-blue-100 border-blue-200';
    }
    if (condition.includes('cloud')) {
      return 'from-gray-50 to-gray-100 border-gray-200';
    }
    if (condition.includes('snow')) {
      return 'from-blue-50 to-indigo-100 border-blue-200';
    }
    if (condition.includes('clear')) {
      return 'from-yellow-50 to-orange-100 border-yellow-200';
    }
    return 'from-sky-50 to-blue-100 border-sky-200';
  };

  return (
    <div className={`bg-gradient-to-br ${getCardGradient()} rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 group`}>
      {/* Header con fecha */}
      <div className="text-center mb-6">
        <h3 className="text-lg font-bold text-gray-800 mb-1">
          {formatDate(forecast.date)}
        </h3>
        <p className="text-xs text-gray-600 uppercase tracking-wide font-medium">
          {new Date(forecast.date).toLocaleDateString('es-ES', { weekday: 'long' })}
        </p>
      </div>

      {/* Icono del clima */}
      <div className="text-center mb-6">
        <div className="bg-white/50 rounded-full p-4 inline-block group-hover:bg-white/70 transition-all duration-300">
          <WeatherIcon 
            icon={forecast.icon} 
            condition={forecast.condition}
            size={56}
            className="group-hover:scale-110 transition-transform duration-300"
          />
        </div>
      </div>

      {/* Descripción del clima */}
      <div className="text-center mb-6">
        <p className="text-sm text-gray-700 font-medium mb-2">
          {getConditionInSpanish(forecast.description)}
        </p>
        <div className="flex justify-center items-center space-x-3">
          <div className="flex items-center">
            <Thermometer size={16} className="text-red-500 mr-1" />
            <span className="text-2xl font-bold text-gray-800">
              {convertTemp(forecast.temperature.max)}°
            </span>
          </div>
          <span className="text-gray-400">/</span>
          <div className="flex items-center">
            <Thermometer size={16} className="text-blue-500 mr-1" />
            <span className="text-lg text-gray-600 font-semibold">
              {convertTemp(forecast.temperature.min)}°
            </span>
          </div>
        </div>
      </div>

      {/* Métricas detalladas */}
      <div className="space-y-4">
        <div className="bg-white/60 rounded-lg p-3 flex items-center justify-between">
          <div className="flex items-center">
            <Droplets size={16} className="text-blue-500 mr-2" />
            <span className="text-sm text-gray-700 font-medium">Humedad</span>
          </div>
          <span className="text-sm font-bold text-gray-800">{forecast.humidity}%</span>
        </div>

        <div className="bg-white/60 rounded-lg p-3 flex items-center justify-between">
          <div className="flex items-center">
            <Wind size={16} className="text-gray-600 mr-2" />
            <span className="text-sm text-gray-700 font-medium">Viento</span>
          </div>
          <span className="text-sm font-bold text-gray-800">{forecast.windSpeed} km/h</span>
        </div>

        {forecast.pop > 0 && (
          <div className="bg-white/60 rounded-lg p-3 flex items-center justify-between">
            <div className="flex items-center">
              <CloudRain size={16} className="text-blue-600 mr-2" />
              <span className="text-sm text-gray-700 font-medium">Lluvia</span>
            </div>
            <span className="text-sm font-bold text-blue-700">{forecast.pop}%</span>
          </div>
        )}
      </div>

      {/* Indicador de calidad */}
      <div className="mt-4 pt-4 border-t border-white/50">
        <div className="flex items-center justify-center">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
          <span className="text-xs text-gray-600 font-medium">Datos verificados</span>
        </div>
      </div>
    </div>
  );
};