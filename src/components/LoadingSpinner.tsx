import React from 'react';
import { Cloud, Zap } from 'lucide-react';

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="relative mb-8">
        {/* Spinner principal */}
        <div className="w-20 h-20 border-4 border-blue-200 rounded-full animate-spin"></div>
        <div className="absolute top-0 left-0 w-20 h-20 border-4 border-blue-500 rounded-full animate-spin border-t-transparent"></div>
        
        {/* Icono central */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Cloud size={32} className="text-blue-500 animate-pulse" />
        </div>
      </div>

      {/* Texto de carga */}
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-800 mb-2 flex items-center justify-center">
          <Zap size={20} className="mr-2 text-yellow-500" />
          Obteniendo datos meteorológicos...
        </h3>
        <p className="text-gray-600 mb-4">
          Conectando con OpenWeatherMap API
        </p>
        
        {/* Barra de progreso animada */}
        <div className="w-64 bg-gray-200 rounded-full h-2 mx-auto">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full animate-pulse" style={{width: '70%'}}></div>
        </div>
        
        <p className="text-sm text-gray-500 mt-3">
          ⚡ Caché inteligente activado • 🔒 Conexión segura
        </p>
      </div>

      {/* Indicadores de estado */}
      <div className="flex items-center space-x-6 mt-8">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></div>
          <span className="text-sm text-gray-600">API Conectada</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
          <span className="text-sm text-gray-600">Procesando</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-purple-500 rounded-full mr-2 animate-pulse"></div>
          <span className="text-sm text-gray-600">Optimizando</span>
        </div>
      </div>
    </div>
  );
};