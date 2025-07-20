import { WeatherData, ForecastDay, ApiResponse, ForecastApiResponse } from '../types/weather';

// Configuración de seguridad mejorada
const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// Validación de API key
if (!API_KEY) {
  console.error('⚠️ ADVERTENCIA: No se encontró la clave API de OpenWeatherMap');
}

// Cache duration: 15 minutos (en milisegundos)
const CACHE_DURATION = (import.meta.env.VITE_CACHE_EXPIRY_MINUTES || 15) * 60 * 1000;

interface CacheEntry {
  data: WeatherData;
  timestamp: number;
}

class WeatherCache {
  private cache = new Map<string, CacheEntry>();
  private readonly maxCacheSize = 100; // Límite de entradas en caché

  get(key: string): WeatherData | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > CACHE_DURATION) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  set(key: string, data: WeatherData): void {
    // Limpiar caché si excede el límite
    if (this.cache.size >= this.maxCacheSize) {
  const firstKey = this.cache.keys().next().value!;
  this.cache.delete(firstKey);
  }

    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  clear(): void {
    this.cache.clear();
  }

  getStats(): { size: number; maxSize: number } {
    return {
      size: this.cache.size,
      maxSize: this.maxCacheSize
    };
  }
}

const weatherCache = new WeatherCache();

export class WeatherService {
  private readonly timeout = 10000; // 10 segundos timeout
  private readonly maxRetries = 3;

  private async fetchWithRetry(url: string, retries = this.maxRetries): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, {
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'WeatherMaster/1.0'
          }
        });

        clearTimeout(timeoutId);

        if (response.ok) return response;
        
        // Manejo específico de errores HTTP
        if (response.status === 404) {
          throw new Error('Ciudad no encontrada. Verifica el nombre e intenta nuevamente.');
        }
        if (response.status === 401) {
          throw new Error('Clave API inválida. Contacta al administrador.');
        }
        if (response.status === 429) {
          throw new Error('Límite de solicitudes excedido. Intenta más tarde.');
        }
        if (response.status >= 500) {
          throw new Error('Error del servidor meteorológico. Intenta más tarde.');
        }

        throw new Error(`Error HTTP ${response.status}: ${response.statusText}`);
      } catch (error) {
        clearTimeout(timeoutId);
        
        if (error instanceof Error) {
          if (error.name === 'AbortError') {
            throw new Error('Tiempo de espera agotado. Verifica tu conexión a internet.');
          }
          if (i === retries - 1) throw error;
        }
        
        // Espera progresiva entre reintentos
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
      }
    }
    
    throw new Error('Error de conexión después de múltiples intentos.');
  }

  private sanitizeInput(input: string): string {
    // Sanitizar entrada para prevenir inyecciones
    return input
      .trim()
      .replace(/[<>\"']/g, '') // Remover caracteres peligrosos
      .substring(0, 100); // Limitar longitud
  }

  async getCurrentWeather(cityName: string): Promise<WeatherData> {
    if (!cityName || typeof cityName !== 'string') {
      throw new Error('Nombre de ciudad inválido.');
    }

    if (!API_KEY) {
      throw new Error('Configuración de API incompleta. Contacta al administrador.');
    }

    const sanitizedCity = this.sanitizeInput(cityName);
    const cacheKey = `current-${sanitizedCity.toLowerCase()}`;
    
    // Intentar obtener datos del caché primero
    const cachedData = weatherCache.get(cacheKey);
    if (cachedData) {
      console.log('📦 Datos obtenidos del caché para:', sanitizedCity);
      return cachedData;
    }

    try {
      const encodedCity = encodeURIComponent(sanitizedCity);
      const currentUrl = `${BASE_URL}/weather?q=${encodedCity}&appid=${API_KEY}&units=metric&lang=es`;
      const forecastUrl = `${BASE_URL}/forecast?q=${encodedCity}&appid=${API_KEY}&units=metric&lang=es`;

      console.log('🌐 Obteniendo datos meteorológicos para:', sanitizedCity);

      const [currentResponse, forecastResponse] = await Promise.all([
        this.fetchWithRetry(currentUrl),
        this.fetchWithRetry(forecastUrl)
      ]);

      const currentData: ApiResponse = await currentResponse.json();
      const forecastData: ForecastApiResponse = await forecastResponse.json();

      const weatherData = this.transformApiResponse(currentData, forecastData);
      
      // Guardar en caché
      weatherCache.set(cacheKey, weatherData);
      console.log('✅ Datos meteorológicos obtenidos y almacenados en caché');

      return weatherData;
    } catch (error) {
      console.error('❌ Error al obtener datos meteorológicos:', error);
      
      if (error instanceof Error) {
        throw new Error(`Error del servicio meteorológico: ${error.message}`);
      }
      throw new Error('Error desconocido al obtener datos meteorológicos.');
    }
  }

  private transformApiResponse(current: ApiResponse, forecast: ForecastApiResponse): WeatherData {
    try {
      // Procesar datos del pronóstico
      const dailyForecasts = this.processForecastData(forecast.list);

      return {
        location: {
          name: current.name || 'Desconocido',
          country: current.sys?.country || 'N/A',
          lat: current.coord?.lat || 0,
          lon: current.coord?.lon || 0,
        },
        current: {
          temperature: Math.round(current.main?.temp || 0),
          feelsLike: Math.round(current.main?.feels_like || 0),
          humidity: current.main?.humidity || 0,
          pressure: current.main?.pressure || 0,
          windSpeed: Math.round((current.wind?.speed || 0) * 3.6), // m/s a km/h
          windDirection: current.wind?.deg || 0,
          visibility: Math.round((current.visibility || 0) / 1000), // m a km
          uvIndex: 0, // No disponible en tier gratuito
          condition: current.weather?.[0]?.main || 'Unknown',
          description: current.weather?.[0]?.description || 'Sin descripción',
          icon: current.weather?.[0]?.icon || '01d',
        },
        forecast: dailyForecasts.slice(0, 5), // Pronóstico de 5 días
      };
    } catch (error) {
      console.error('Error al transformar respuesta de API:', error);
      throw new Error('Error al procesar datos meteorológicos.');
    }
  }

  private processForecastData(forecastList: ForecastApiResponse['list']): ForecastDay[] {
    if (!Array.isArray(forecastList) || forecastList.length === 0) {
      return [];
    }

    const dailyData = new Map<string, any[]>();

    forecastList.forEach(item => {
      if (!item.dt) return;
      
      const date = new Date(item.dt * 1000).toISOString().split('T')[0];
      if (!dailyData.has(date)) {
        dailyData.set(date, []);
      }
      dailyData.get(date)!.push(item);
    });

    return Array.from(dailyData.entries()).map(([date, dayData]) => {
      if (!dayData || dayData.length === 0) {
        return this.createEmptyForecastDay(date);
      }

      const temps = dayData.map(d => d.main?.temp || 0).filter(t => t > 0);
      const midDayData = dayData[Math.floor(dayData.length / 2)] || dayData[0];
      
      return {
        date,
        temperature: {
          min: temps.length > 0 ? Math.round(Math.min(...temps)) : 0,
          max: temps.length > 0 ? Math.round(Math.max(...temps)) : 0,
        },
        condition: midDayData.weather?.[0]?.main || 'Unknown',
        description: midDayData.weather?.[0]?.description || 'Sin descripción',
        icon: midDayData.weather?.[0]?.icon || '01d',
        humidity: Math.round(
          dayData.reduce((sum, d) => sum + (d.main?.humidity || 0), 0) / dayData.length
        ),
        windSpeed: Math.round(
          dayData.reduce((sum, d) => sum + (d.wind?.speed || 0), 0) / dayData.length * 3.6
        ),
        pop: Math.round(Math.max(...dayData.map(d => d.pop || 0)) * 100),
      };
    });
  }

  private createEmptyForecastDay(date: string): ForecastDay {
    return {
      date,
      temperature: { min: 0, max: 0 },
      condition: 'Unknown',
      description: 'Sin datos',
      icon: '01d',
      humidity: 0,
      windSpeed: 0,
      pop: 0,
    };
  }

  clearCache(): void {
    weatherCache.clear();
    console.log('🗑️ Caché limpiado');
  }

  getCacheStats(): { size: number; maxSize: number } {
    return weatherCache.getStats();
  }
}

export const weatherService = new WeatherService();