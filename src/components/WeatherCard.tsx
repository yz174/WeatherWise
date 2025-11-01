import { useEffect, useState, memo, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetCurrentWeatherQuery } from '../store/weatherApi';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { removeFavorite } from '../store/favoritesSlice';
import { getTemperatureDisplay } from '../utils/temperature';
import { useRetry } from '../hooks/useRetry';
import { getErrorInfo, getErrorIcon } from '../utils/errorHandling';
import './WeatherCard.css';

interface WeatherCardProps {
  cityId: string;
}

const WeatherCard = memo(({ cityId }: WeatherCardProps) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const temperatureUnit = useAppSelector((state) => state.settings.temperatureUnit);
  const [showRetryCountdown, setShowRetryCountdown] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dataAge, setDataAge] = useState(0);

  // Fetch weather data via RTK Query
  const { data: weather, isLoading, error, refetch } = useGetCurrentWeatherQuery(cityId);

  // Retry logic with exponential backoff
  const { retry, canRetry, retryCount, isRetrying, nextRetryDelay, maxRetries } = useRetry({
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 10000,
  });

  // Track data age and update every second
  useEffect(() => {
    if (!weather) return;

    const updateAge = () => {
      const age = Date.now() - weather.lastUpdated;
      setDataAge(age);
    };

    updateAge();
    const interval = setInterval(updateAge, 1000);

    return () => clearInterval(interval);
  }, [weather]);

  // Auto-refresh when data is older than 60 seconds
  useEffect(() => {
    if (weather && dataAge > 60000) {
      refetch();
    }
  }, [weather, dataAge, refetch]);

  // Automatic refetch when tab regains focus
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && weather) {
        const age = Date.now() - weather.lastUpdated;
        if (age > 60000) {
          refetch();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [weather, refetch]);

  const handleCardClick = useCallback(() => {
    navigate(`/city/${encodeURIComponent(cityId)}`);
  }, [navigate, cityId]);

  const handleToggleFavorite = useCallback((e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigation when clicking favorite button
    dispatch(removeFavorite(cityId));
  }, [dispatch, cityId]);

  const handleRetry = useCallback(async () => {
    setShowRetryCountdown(true);
    await retry(async () => {
      await refetch();
    });
    setShowRetryCountdown(false);
  }, [retry, refetch]);

  const handleManualRefresh = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigation when clicking refresh button
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      // Keep the refreshing state for a brief moment to show feedback
      setTimeout(() => setIsRefreshing(false), 500);
    }
  }, [refetch]);

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="weather-card loading">
        <div className="skeleton skeleton-title"></div>
        <div className="skeleton skeleton-temp"></div>
        <div className="skeleton skeleton-condition"></div>
        <div className="skeleton skeleton-details"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    const errorInfo = getErrorInfo(error);
    const errorIcon = getErrorIcon(errorInfo.type);

    return (
      <div className={`weather-card error error-${errorInfo.type}`}>
        <button
          className="favorite-button remove-on-error"
          onClick={handleToggleFavorite}
          title="Remove from favorites"
        >
          ✕
        </button>
        <div className="error-message">
          <span className="error-icon">{errorIcon}</span>
          <p className="error-text">{errorInfo.message}</p>
          {errorInfo.statusCode && (
            <p className="error-code">Error code: {errorInfo.statusCode}</p>
          )}
          {errorInfo.canRetry && canRetry && (
            <div className="retry-section">
              <button
                className="retry-button"
                onClick={handleRetry}
                disabled={isRetrying}
              >
                {isRetrying ? 'Retrying...' : 'Retry'}
              </button>
              {retryCount > 0 && (
                <p className="retry-info">
                  Attempt {retryCount} of {maxRetries}
                  {showRetryCountdown && ` (waiting ${Math.ceil(nextRetryDelay / 1000)}s)`}
                </p>
              )}
            </div>
          )}
          {errorInfo.type === 'rate_limit' && (
            <p className="rate-limit-warning">
              API rate limit reached. Please wait before retrying.
            </p>
          )}
          {errorInfo.type === 'not_found' && (
            <button
              className="remove-city-button"
              onClick={handleToggleFavorite}
            >
              Remove City
            </button>
          )}
        </div>
      </div>
    );
  }

  // No data
  if (!weather) {
    return null;
  }

  const isStale = dataAge > 60000;
  const ageInSeconds = Math.floor(dataAge / 1000);

  // Memoize temperature display calculation
  const temperatureDisplay = useMemo(() => {
    if (!weather) return '';
    return getTemperatureDisplay(weather.current.temperature, temperatureUnit, 0);
  }, [weather, temperatureUnit]);

  // Memoize weather icon
  const weatherIcon = useMemo(() => {
    if (!weather) return '';
    return getWeatherIcon(weather.current.conditionCode);
  }, [weather]);

  return (
    <div className={`weather-card ${isStale ? 'stale' : ''}`} onClick={handleCardClick}>
      <button className="favorite-button" onClick={handleToggleFavorite} title="Remove from favorites">
        ★
      </button>

      <button 
        className={`refresh-button ${isRefreshing ? 'refreshing' : ''}`}
        onClick={handleManualRefresh}
        disabled={isRefreshing}
        title="Refresh weather data"
      >
        🔄
      </button>

      {isStale && (
        <div className="stale-indicator" title={`Data is ${ageInSeconds}s old`}>
          ⚠️ Stale ({ageInSeconds}s)
        </div>
      )}
      {!isStale && dataAge > 30000 && (
        <div className="age-indicator" title={`Last updated ${ageInSeconds}s ago`}>
          {ageInSeconds}s ago
        </div>
      )}

      <div className="city-header">
        <h3 className="city-name">{weather.cityName}</h3>
        <p className="country">{weather.country}</p>
      </div>

      <div className="temperature-display">
        <span className="temperature">
          {temperatureDisplay}
        </span>
      </div>

      <div className="condition">
        <span className="condition-icon">
          {weatherIcon}
        </span>
        <span className="condition-text">{weather.current.condition}</span>
      </div>

      <div className="weather-details">
        <div className="detail-item">
          <span className="detail-icon">💧</span>
          <span className="detail-label">Humidity</span>
          <span className="detail-value">{weather.current.humidity}%</span>
        </div>
        <div className="detail-item">
          <span className="detail-icon">💨</span>
          <span className="detail-label">Wind</span>
          <span className="detail-value">{weather.current.windSpeed.toFixed(1)} km/h</span>
        </div>
      </div>
    </div>
  );
});

// Helper function to get weather icon based on condition code
function getWeatherIcon(conditionCode: number): string {
  // WeatherAPI condition codes
  if (conditionCode === 1000) return '☀️'; // Sunny/Clear
  if ([1003, 1006, 1009].includes(conditionCode)) return '☁️'; // Cloudy
  if ([1063, 1180, 1183, 1186, 1189, 1192, 1195, 1240, 1243, 1246].includes(conditionCode)) return '🌧️'; // Rain
  if ([1066, 1210, 1213, 1216, 1219, 1222, 1225, 1255, 1258].includes(conditionCode)) return '❄️'; // Snow
  if ([1087, 1273, 1276, 1279, 1282].includes(conditionCode)) return '⛈️'; // Thunderstorm
  if ([1030, 1135, 1147].includes(conditionCode)) return '🌫️'; // Fog/Mist
  return '🌤️'; // Default
}

export default WeatherCard;
