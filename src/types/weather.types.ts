// Weather data type definitions

export interface CurrentWeather {
  cityId: string;
  cityName: string;
  country: string;
  timezone: string; // IANA timezone identifier (e.g., "America/New_York")
  coordinates: {
    lat: number;
    lon: number;
  };
  current: {
    timestamp: number;
    temperature: number;
    feelsLike: number;
    condition: string;
    conditionCode: number;
    humidity: number;
    pressure: number;
    windSpeed: number;
    windDirection: number;
    uvIndex: number;
    visibility: number;
    dewPoint: number;
  };
  lastUpdated: number; // Unix timestamp
}

export interface DailyForecast {
  date: string; // YYYY-MM-DD
  tempMax: number;
  tempMin: number;
  condition: string;
  conditionCode: number;
  precipitationChance: number;
  precipitationAmount: number;
  windSpeed: number;
  humidity: number;
}

export interface HourlyForecast {
  timestamp: number;
  temperature: number;
  condition: string;
  conditionCode: number;
  precipitationChance: number;
  windSpeed: number;
  windDirection: number;
}

export interface ForecastData {
  cityId: string;
  daily: DailyForecast[];
  hourly: HourlyForecast[];
}
