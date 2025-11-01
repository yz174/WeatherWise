import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetForecastQuery, useGetCurrentWeatherQuery } from '../store/weatherApi';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { signOut } from '../services/authService';
import { clearUser, setLoading as setAuthLoading } from '../store/authSlice';
import { useRetry } from '../hooks/useRetry';
import { getErrorInfo, getErrorIcon } from '../utils/errorHandling';
import ForecastSection from '../components/ForecastSection';
import ChartsSection from '../components/ChartsSection';
import TodaysHighlights from '../components/TodaysHighlights';
import SidebarStats from '../components/SidebarStats';
import './DetailedView.css';

// Import weather background images
import sunnyBg from '../assets/sunny.png';
import rainyBg from '../assets/rainy.png';
import stormyBg from '../assets/stormy.png';
import partlyCloudyBg from '../assets/partly cloudy.png';
import eveningBg from '../assets/evening.png';
import nightBg from '../assets/night.png';

// Import weather icons
// Weather icons from public folder
const sunnyIcon = '/weathericons/sunnyicon.png';
const cloudyIcon = '/weathericons/cloudyicon.png';
const partiallyCloudyIcon = '/weathericons/partiallycloudyicon.png';
const rainIcon = '/weathericons/rainicon.png';
const heavyRainIcon = '/weathericons/heavyrainicon.png';
const drizzlingIcon = '/weathericons/drizzlingicon.png';
const snowIcon = '/weathericons/snowicon.png';
const thunderstormIcon = '/weathericons/heavythunderstormicon.png';
const windyIcon = '/weathericons/windyicon.png';

// Helper function to get time of day based on city's timezone
function getTimeOfDay(timezone?: string): 'morning' | 'evening' | 'night' {
  const now = new Date();
  const options: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    hour12: false,
    timeZone: timezone
  };
  
  const hourString = now.toLocaleString('en-US', options);
  const hour = parseInt(hourString);
  
  // Evening: 5 PM (17:00) to 7 PM (19:00)
  if (hour >= 17 && hour < 19) return 'evening';
  
  // Night: 7 PM (19:00) to 6 AM (6:00)
  if (hour >= 19 || hour < 6) return 'night';
  
  // Morning/Day: 6 AM (6:00) to 5 PM (17:00)
  return 'morning';
}

// Helper function to get weather background based on time and weather
function getWeatherBackground(conditionCode: number, timezone?: string): string {
  const timeOfDay = getTimeOfDay(timezone);
  
  // Override with time-based backgrounds
  if (timeOfDay === 'evening') return eveningBg;
  if (timeOfDay === 'night') return nightBg;
  
  // Daytime weather-based backgrounds
  if (conditionCode === 1000) return sunnyBg;
  if ([1003].includes(conditionCode)) return partlyCloudyBg;
  if ([1006, 1009].includes(conditionCode)) return partlyCloudyBg;
  if ([
    1063, 1150, 1153, 1168, 1171, 1180, 1183, 1186, 1189, 1192, 1195,
    1198, 1201, 1240, 1243, 1246
  ].includes(conditionCode)) return rainyBg;
  if ([1087, 1273, 1276, 1279, 1282].includes(conditionCode)) return stormyBg;
  if ([
    1066, 1114, 1117, 1210, 1213, 1216, 1219, 1222, 1225, 1237,
    1255, 1258, 1261, 1264
  ].includes(conditionCode)) return rainyBg;
  if ([1030, 1135, 1147].includes(conditionCode)) return partlyCloudyBg;
  return sunnyBg;
}

// Helper function to get weather icon image
function getWeatherIconImage(conditionCode: number): string {
  // Sunny/Clear
  if (conditionCode === 1000) return sunnyIcon;
  
  // Partly Cloudy
  if ([1003].includes(conditionCode)) return partiallyCloudyIcon;
  
  // Cloudy/Overcast
  if ([1006, 1009].includes(conditionCode)) return cloudyIcon;
  
  // Drizzle/Light Rain
  if ([1063, 1150, 1153, 1168, 1171, 1180, 1183].includes(conditionCode)) return drizzlingIcon;
  
  // Rain
  if ([1186, 1189, 1240].includes(conditionCode)) return rainIcon;
  
  // Heavy Rain
  if ([1192, 1195, 1198, 1201, 1243, 1246].includes(conditionCode)) return heavyRainIcon;
  
  // Snow
  if ([1066, 1114, 1117, 1210, 1213, 1216, 1219, 1222, 1225, 1237, 1255, 1258, 1261, 1264].includes(conditionCode)) return snowIcon;
  
  // Thunderstorm
  if ([1087, 1273, 1276, 1279, 1282].includes(conditionCode)) return thunderstormIcon;
  
  // Fog/Mist
  if ([1030, 1135, 1147].includes(conditionCode)) return windyIcon;
  
  // Default
  return sunnyIcon;
}

const DetailedView = () => {
  const { cityId } = useParams<{ cityId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const temperatureUnit = useAppSelector((state) => state.settings.temperatureUnit);
  const { user, isLoading: authLoading } = useAppSelector((state) => state.auth);
  const [showRetryCountdown, setShowRetryCountdown] = useState(false);

  const handleSignOut = async () => {
    dispatch(setAuthLoading(true));
    const result = await signOut();
    
    if (result.success) {
      dispatch(clearUser());
      navigate('/login');
    } else {
      dispatch(setAuthLoading(false));
      console.error('Sign out failed:', result.error);
    }
  };

  // Fetch forecast data
  const {
    data: forecastData,
    isLoading: forecastLoading,
    error: forecastError,
    refetch: refetchForecast,
  } = useGetForecastQuery(cityId || '', {
    skip: !cityId,
  });

  // Fetch current weather for summary
  const {
    data: currentWeather,
    isLoading: currentLoading,
    error: currentError,
    refetch: refetchCurrent,
  } = useGetCurrentWeatherQuery(cityId || '', {
    skip: !cityId,
  });

  // Retry logic with exponential backoff
  const { retry, canRetry, retryCount, isRetrying, nextRetryDelay, maxRetries } = useRetry({
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 10000,
  });

  const handleRetry = async () => {
    setShowRetryCountdown(true);
    await retry(async () => {
      await Promise.all([refetchForecast(), refetchCurrent()]);
    });
    setShowRetryCountdown(false);
  };

  if (!cityId) {
    return (
      <div className="detailed-view">
        <div className="error-container">
          <span className="error-icon-large">🔍</span>
          <p className="error-title">No city specified</p>
          <button onClick={() => navigate('/')} className="back-button">
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (forecastLoading || currentLoading) {
    return (
      <div className="detailed-view">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading weather data...</p>
          <div className="loading-skeleton-detailed">
            <div className="skeleton skeleton-header"></div>
            <div className="skeleton skeleton-summary"></div>
            <div className="skeleton skeleton-forecast"></div>
            <div className="skeleton skeleton-charts"></div>
          </div>
        </div>
      </div>
    );
  }

  const error = forecastError || currentError;
  if (error || !forecastData || !currentWeather) {
    const errorInfo = getErrorInfo(error);
    const errorIcon = getErrorIcon(errorInfo.type);

    return (
      <div className="detailed-view">
        <div className="error-container">
          <button onClick={() => navigate('/')} className="back-button back-button-error">
            ← Back to Dashboard
          </button>
          <span className="error-icon-large">{errorIcon}</span>
          <p className="error-title">{errorInfo.message}</p>
          {errorInfo.statusCode && (
            <p className="error-code-large">Error code: {errorInfo.statusCode}</p>
          )}
          {errorInfo.canRetry && canRetry && (
            <div className="retry-section-detailed">
              <button
                className="retry-button-large"
                onClick={handleRetry}
                disabled={isRetrying}
              >
                {isRetrying ? 'Retrying...' : 'Retry'}
              </button>
              {retryCount > 0 && (
                <p className="retry-info-detailed">
                  Attempt {retryCount} of {maxRetries}
                  {showRetryCountdown && ` (waiting ${Math.ceil(nextRetryDelay / 1000)}s)`}
                </p>
              )}
            </div>
          )}
          {errorInfo.type === 'rate_limit' && (
            <div className="rate-limit-warning-large">
              <p>⏱️ API rate limit reached</p>
              <p>Please wait a few moments before trying again.</p>
            </div>
          )}
          {errorInfo.type === 'not_found' && (
            <p className="not-found-hint">
              This city may not exist or the name might be misspelled.
            </p>
          )}
        </div>
      </div>
    );
  }

  // Get the appropriate background image based on weather and city's time
  const backgroundImage = currentWeather ? getWeatherBackground(currentWeather.current.conditionCode, currentWeather.timezone) : sunnyBg;

  return (
    <div className="detailed-view-modern" style={{ backgroundImage: `url(${backgroundImage})` }}>
      <div className="detailed-view-overlay"></div>
      
      {/* Top Bar */}
      <div className="detailed-topbar">
        <div className="logo">WeatherWise</div>
        <div className="topbar-actions">
          {user && (
            <>
              <div className="user-profile-dashboard">
                {user.photoURL && (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="user-avatar-dashboard"
                  />
                )}
                <span className="user-name-dashboard">
                  {user.displayName || user.email}
                </span>
              </div>
              <button
                onClick={handleSignOut}
                disabled={authLoading}
                className="sign-out-btn-dashboard"
                title="Sign Out"
              >
                {authLoading ? 'Signing out...' : 'Sign Out'}
              </button>
            </>
          )}
        </div>
      </div>
      
      <div className="detailed-layout">
        {/* Left Sidebar */}
        <aside className="weather-sidebar">
          <div className="sidebar-content">
            {/* Weather Icon */}
            <div className="weather-icon-display">
              <img 
                src={getWeatherIconImage(currentWeather.current.conditionCode)} 
                alt={currentWeather.current.condition}
                className="weather-icon-img"
              />
            </div>

            {/* Temperature */}
            <div className="temperature-display">
              <span className="temp-number">
                {Math.round(
                  temperatureUnit === 'celsius' 
                    ? currentWeather.current.temperature 
                    : (currentWeather.current.temperature * 9/5) + 32
                )}
              </span>
              <span className="temp-unit">°{temperatureUnit === 'celsius' ? 'C' : 'F'}</span>
            </div>

            {/* Location */}
            <div className="location-display">
              <img src="/src/assets/location.png" alt="Location" className="location-icon-img" />
              <span className="location-text">
                {currentWeather.cityName}, {currentWeather.country}
              </span>
            </div>

            {/* Date & Time */}
            <div className="datetime-display">
              <img src="/src/assets/calendar-clock.png" alt="Date Time" className="datetime-icon-img" />
              <span className="datetime-text">
                {new Date().toLocaleDateString('en-US', { 
                  day: '2-digit', 
                  month: 'long', 
                  year: 'numeric',
                  timeZone: currentWeather.timezone
                })}, {new Date().toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  hour12: true,
                  timeZone: currentWeather.timezone
                })}
              </span>
            </div>

            {/* Sidebar Stats (Humidity, Visibility, Feels Like) */}
            <SidebarStats currentWeather={currentWeather} />
          </div>
        </aside>

        {/* Main Content */}
        <main className="weather-main-content">
          {/* Back Button */}
          <button onClick={() => navigate('/')} className="back-button-modern">
            ← Back to Dashboard
          </button>

          {/* Today's Highlights */}
          <TodaysHighlights 
            currentWeather={currentWeather} 
            hourlyData={forecastData.hourly}
            timezone={currentWeather.timezone}
          />

          {/* 7 Days Forecast - Above Charts */}
          <div className="main-forecast-section">
            <ForecastSection dailyForecasts={forecastData.daily} compact={false} />
          </div>

          {/* Charts Section - Full Width */}
          <div className="charts-full-section">
            <ChartsSection forecastData={forecastData} timezone={currentWeather.timezone} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DetailedView;
