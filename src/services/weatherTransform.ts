// Service for transforming WeatherAPI responses to application types
import type { CurrentWeather, ForecastData, DailyForecast, HourlyForecast } from '../types/weather.types';
import type { City } from '../types/city.types';

// WeatherAPI raw response interfaces
export interface WeatherApiCurrentResponse {
  location: {
    name: string;
    country: string;
    lat: number;
    lon: number;
    tz_id: string; // IANA timezone identifier
  };
  current: {
    last_updated_epoch: number;
    temp_c: number;
    temp_f: number;
    feelslike_c: number;
    feelslike_f: number;
    condition: {
      text: string;
      code: number;
    };
    humidity: number;
    pressure_mb: number;
    wind_kph: number;
    wind_degree: number;
    uv: number;
    vis_km: number;
    dewpoint_c: number;
  };
}

export interface WeatherApiForecastResponse {
  location: {
    name: string;
  };
  forecast: {
    forecastday: Array<{
      date: string;
      day: {
        maxtemp_c: number;
        mintemp_c: number;
        condition: {
          text: string;
          code: number;
        };
        daily_chance_of_rain: number;
        totalprecip_mm: number;
        maxwind_kph: number;
        avghumidity: number;
      };
      hour: Array<{
        time_epoch: number;
        temp_c: number;
        condition: {
          text: string;
          code: number;
        };
        chance_of_rain: number;
        wind_kph: number;
        wind_degree: number;
      }>;
    }>;
  };
}

export interface WeatherApiSearchResponse {
  id: number;
  name: string;
  region: string;
  country: string;
  lat: number;
  lon: number;
}

/**
 * Transform WeatherAPI current weather response to CurrentWeather interface
 * Handles missing or null fields with sensible defaults
 */
export const transformCurrentWeather = (
  response: WeatherApiCurrentResponse,
  cityId: string
): CurrentWeather => {
  // Validate required fields
  if (!response?.location || !response?.current) {
    throw new Error('Invalid weather API response: missing required fields');
  }

  return {
    cityId,
    cityName: response.location.name || 'Unknown',
    country: response.location.country || 'Unknown',
    timezone: response.location.tz_id || 'UTC',
    coordinates: {
      lat: response.location.lat ?? 0,
      lon: response.location.lon ?? 0,
    },
    current: {
      timestamp: response.current.last_updated_epoch || Math.floor(Date.now() / 1000),
      temperature: response.current.temp_c ?? 0,
      feelsLike: response.current.feelslike_c ?? response.current.temp_c ?? 0,
      condition: response.current.condition?.text || 'Unknown',
      conditionCode: response.current.condition?.code ?? 0,
      humidity: response.current.humidity ?? 0,
      pressure: response.current.pressure_mb ?? 0,
      windSpeed: response.current.wind_kph ?? 0,
      windDirection: response.current.wind_degree ?? 0,
      uvIndex: response.current.uv ?? 0,
      visibility: response.current.vis_km ?? 0,
      dewPoint: response.current.dewpoint_c ?? 0,
    },
    lastUpdated: Date.now(),
  };
};

/**
 * Transform WeatherAPI forecast response to ForecastData interface
 * Handles missing or null fields with sensible defaults
 */
export const transformForecast = (
  response: WeatherApiForecastResponse,
  cityId: string
): ForecastData => {
  // Validate required fields
  if (!response?.forecast?.forecastday) {
    throw new Error('Invalid forecast API response: missing forecast data');
  }

  const daily: DailyForecast[] = response.forecast.forecastday.map((day) => ({
    date: day.date || new Date().toISOString().split('T')[0],
    tempMax: day.day?.maxtemp_c ?? 0,
    tempMin: day.day?.mintemp_c ?? 0,
    condition: day.day?.condition?.text || 'Unknown',
    conditionCode: day.day?.condition?.code ?? 0,
    precipitationChance: day.day?.daily_chance_of_rain ?? 0,
    precipitationAmount: day.day?.totalprecip_mm ?? 0,
    windSpeed: day.day?.maxwind_kph ?? 0,
    humidity: day.day?.avghumidity ?? 0,
  }));

  const hourly: HourlyForecast[] = response.forecast.forecastday.flatMap((day) => {
    if (!day.hour || !Array.isArray(day.hour)) {
      return [];
    }

    return day.hour.map((hour) => ({
      timestamp: hour.time_epoch || Math.floor(Date.now() / 1000),
      temperature: hour.temp_c ?? 0,
      condition: hour.condition?.text || 'Unknown',
      conditionCode: hour.condition?.code ?? 0,
      precipitationChance: hour.chance_of_rain ?? 0,
      windSpeed: hour.wind_kph ?? 0,
      windDirection: hour.wind_degree ?? 0,
    }));
  });

  return {
    cityId,
    daily,
    hourly,
  };
};

/**
 * Transform WeatherAPI search response to City[] interface
 * Handles missing or null fields with sensible defaults
 */
export const transformSearchResults = (
  results: WeatherApiSearchResponse[]
): City[] => {
  // Handle null or undefined results
  if (!results || !Array.isArray(results)) {
    return [];
  }

  return results
    .filter((result) => result && result.id && result.name) // Filter out invalid entries
    .map((result) => ({
      id: result.id.toString(),
      name: result.name,
      country: result.country || 'Unknown',
      region: result.region || '',
      coordinates: {
        lat: result.lat ?? 0,
        lon: result.lon ?? 0,
      },
    }));
};
