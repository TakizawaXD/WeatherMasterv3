import { useState, useCallback } from 'react';
import { WeatherData } from '../types/weather';
import { weatherService } from '../services/weatherApi';

interface UseWeatherReturn {
  data: WeatherData | null;
  loading: boolean;
  error: string | null;
  fetchWeather: (city: string) => Promise<void>;
  clearError: () => void;
}

export const useWeather = (): UseWeatherReturn => {
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = useCallback(async (city: string) => {
    if (!city.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const weatherData = await weatherService.getCurrentWeather(city);
      setData(weatherData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch weather data';
      setError(errorMessage);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    data,
    loading,
    error,
    fetchWeather,
    clearError,
  };
};