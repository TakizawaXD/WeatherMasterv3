import React from 'react';
import { Sun, Moon, Cloud, CloudRain, CloudSnow, Zap, Eye, CloudDrizzle, Cog as Fog } from 'lucide-react';

interface WeatherIconProps {
  icon: string;
  condition: string;
  size?: number;
  className?: string;
}

export const WeatherIcon: React.FC<WeatherIconProps> = ({ 
  icon, 
  condition, 
  size = 48, 
  className = "" 
}) => {
  const getIconComponent = () => {
    const iconCode = icon.slice(0, 2);
    const isNight = icon.includes('n');
    
    switch (iconCode) {
      case '01': // clear sky
        return isNight ? (
          <Moon size={size} className={`text-slate-300 ${className}`} />
        ) : (
          <Sun size={size} className={`text-yellow-400 ${className}`} />
        );
      case '02': // few clouds
      case '03': // scattered clouds
        return <Cloud size={size} className={`text-gray-400 ${className}`} />;
      case '04': // broken clouds
        return <Cloud size={size} className={`text-gray-500 ${className}`} />;
      case '09': // shower rain
        return <CloudDrizzle size={size} className={`text-blue-400 ${className}`} />;
      case '10': // rain
        return <CloudRain size={size} className={`text-blue-500 ${className}`} />;
      case '11': // thunderstorm
        return <Zap size={size} className={`text-yellow-500 ${className}`} />;
      case '13': // snow
        return <CloudSnow size={size} className={`text-blue-200 ${className}`} />;
      case '50': // mist/fog
        return <Fog size={size} className={`text-gray-400 ${className}`} />;
      default:
        return <Sun size={size} className={`text-yellow-400 ${className}`} />;
    }
  };

  return (
    <div className="flex items-center justify-center">
      {getIconComponent()}
    </div>
  );
};