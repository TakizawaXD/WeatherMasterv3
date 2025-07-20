import React from 'react';
import { AlertTriangle, RefreshCw, Wifi, Shield } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onRetry }) => {
  const getErrorType = (message: string) => {
    if (message.toLowerCase().includes('not found') || message.toLowerCase().includes('ciudad')) {
      return {
        type: 'city',
        title: 'Ciudad no encontrada',
        suggestion: 'Verifica el nombre de la ciudad e intenta nuevamente',
        icon: <AlertTriangle size={48} className="text-orange-500" />
      };
    }
    if (message.toLowerCase().includes('network') || message.toLowerCase().includes('fetch')) {
      return {
        type: 'network',
        title: 'Error de conexión',
        suggestion: 'Verifica tu conexión a internet',
        icon: <Wifi size={48} className="text-red-500" />
      };
    }
    if (message.toLowerCase().includes('api') || message.toLowerCase().includes('key')) {
      return {
        type: 'api',
        title: 'Error de API',
        suggestion: 'Problema con el servicio meteorológico',
        icon: <Shield size={48} className="text-purple-500" />
      };
    }
    return {
      type: 'general',
      title: 'Error inesperado',
      suggestion: 'Algo salió mal, intenta nuevamente',
      icon: <AlertTriangle size={48} className="text-red-500" />
    };
  };

  const errorInfo = getErrorType(message);

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6">
      <div className="bg-white border-2 border-red-100 rounded-2xl p-8 max-w-md w-full text-center shadow-xl">
        {/* Icono de error */}
        <div className="mb-6">
          {errorInfo.icon}
        </div>

        {/* Título del error */}
        <h3 className="text-2xl font-bold text-gray-800 mb-3">
          {errorInfo.title}
        </h3>

        {/* Mensaje de error */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-700 text-sm font-medium">{message}</p>
        </div>

        {/* Sugerencia */}
        <p className="text-gray-600 mb-6">
          {errorInfo.suggestion}
        </p>

        {/* Botones de acción */}
        <div className="space-y-3">
          {onRetry && (
            <button
              onClick={onRetry}
              className="w-full inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
            >
              <RefreshCw size={18} className="mr-2" />
              Intentar nuevamente
            </button>
          )}
          
          <button
            onClick={() => window.location.reload()}
            className="w-full inline-flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium"
          >
            Recargar página
          </button>
        </div>

        {/* Consejos adicionales */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="text-sm font-semibold text-blue-800 mb-2">💡 Consejos:</h4>
          <ul className="text-xs text-blue-700 space-y-1 text-left">
            <li>• Verifica la ortografía del nombre de la ciudad</li>
            <li>• Intenta con el nombre en inglés (ej: "London" en lugar de "Londres")</li>
            <li>• Asegúrate de tener conexión a internet estable</li>
            <li>• Si el problema persiste, intenta más tarde</li>
          </ul>
        </div>
      </div>
    </div>
  );
};