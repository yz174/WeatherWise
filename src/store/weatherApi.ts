// RTK Query API slice for weather data
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { CurrentWeather, ForecastData } from '../types/weather.types';
import type { City } from '../types/city.types';
import {
  transformCurrentWeather,
  transformForecast,
  transformSearchResults,
  type WeatherApiCurrentResponse,
  type WeatherApiForecastResponse,
  type WeatherApiSearchResponse,
} from '../services/weatherTransform';

const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

export const weatherApi = createApi({
  reducerPath: 'weatherApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://api.weatherapi.com/v1',
  }),
  tagTypes: ['Weather', 'Forecast'],
  refetchOnFocus: true, // Automatically refetch when window regains focus
  refetchOnReconnect: true, // Automatically refetch when network reconnects
  endpoints: (builder) => ({
    getCurrentWeather: builder.query<CurrentWeather, string>({
      query: (cityId) => ({
        url: '/current.json',
        params: {
          key: API_KEY,
          q: cityId,
          aqi: 'no',
        },
      }),
      transformResponse: (response: WeatherApiCurrentResponse, _meta, cityId) =>
        transformCurrentWeather(response, cityId),
      providesTags: (_result, _error, cityId) => [{ type: 'Weather', id: cityId }],
      keepUnusedDataFor: 60, // Cache for 60 seconds
    }),

    getForecast: builder.query<ForecastData, string>({
      query: (cityId) => ({
        url: '/forecast.json',
        params: {
          key: API_KEY,
          q: cityId,
          days: 7,
          aqi: 'no',
          alerts: 'no',
        },
      }),
      transformResponse: (response: WeatherApiForecastResponse, _meta, cityId) =>
        transformForecast(response, cityId),
      providesTags: (_result, _error, cityId) => [{ type: 'Forecast', id: cityId }],
      keepUnusedDataFor: 300, // Cache for 5 minutes
    }),

    searchCities: builder.query<City[], string>({
      query: (searchQuery) => ({
        url: '/search.json',
        params: {
          key: API_KEY,
          q: searchQuery,
        },
      }),
      transformResponse: (response: WeatherApiSearchResponse[]) =>
        transformSearchResults(response),
      keepUnusedDataFor: 600, // Cache for 10 minutes
    }),
  }),
});

// Export typed hooks
export const {
  useGetCurrentWeatherQuery,
  useGetForecastQuery,
  useSearchCitiesQuery,
} = weatherApi;
