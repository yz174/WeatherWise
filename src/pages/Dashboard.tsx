import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { useGetCurrentWeatherQuery } from '../store/weatherApi';
import { signOut } from '../services/authService';
import { clearUser, setLoading } from '../store/authSlice';
import SearchBar from '../components/SearchBar';
import SettingsPanel from '../components/SettingsPanel';
import './Dashboard.css';

// Import dashboard background
import dashboardBg from '../assets/dashboard background.png';

// Import weather icons
import sunnyIcon from '../assets/weathericons/sunnyicon.png';
import cloudyIcon from '../assets/weathericons/cloudyicon.png';
import partiallyCloudyIcon from '../assets/weathericons/partiallycloudyicon.png';
import cloudyClearIcon from '../assets/weathericons/cloudyclearicon.png';
import rainIcon from '../assets/weathericons/rainicon.png';
import heavyRainIcon from '../assets/weathericons/heavyrainicon.png';
import drizzlingIcon from '../assets/weathericons/drizzlingicon.png';
import snowIcon from '../assets/weathericons/snowicon.png';
import heavyThunderstormIcon from '../assets/weathericons/heavythunderstormicon.png';
import windyIcon from '../assets/weathericons/windyicon.png';

// Import stat icons
import raindropIcon from '../assets/raindrops.png';
import eyeIcon from '../assets/eye (1).png';
import heartIcon from '../assets/heart.png';
import settingsIcon from '../assets/settings.png';

// Import favorite actions
import { togglePinned } from '../store/favoritesSlice';

const Dashboard = () => {
  const [showSettings, setShowSettings] = useState(false);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const favorites = useAppSelector((state) => state.favorites.cityIds);
  const pinnedCities = useAppSelector((state) => state.favorites.pinnedCityIds || []);
  const temperatureUnit = useAppSelector((state) => state.settings.temperatureUnit);
  const { user, isLoading } = useAppSelector((state) => state.auth);

  // Debug logging
  console.log('Dashboard - favorites:', favorites);
  console.log('Dashboard - pinnedCities:', pinnedCities);

  // Sort cities: pinned first, then others
  const sortedFavorites = [...favorites].sort((a, b) => {
    const aIsPinned = pinnedCities.includes(a);
    const bIsPinned = pinnedCities.includes(b);
    if (aIsPinned && !bIsPinned) return -1;
    if (!aIsPinned && bIsPinned) return 1;
    return 0;
  });

  const handleSignOut = async () => {
    dispatch(setLoading(true));
    const result = await signOut();
    
    if (result.success) {
      dispatch(clearUser());
      navigate('/login');
    } else {
      dispatch(setLoading(false));
      console.error('Sign out failed:', result.error);
    }
  };



  return (
    <div className="dashboard-overview">
      {/* Dashboard Background with Blur */}
      <div 
        className="dashboard-bg"
        style={{ backgroundImage: `url(${dashboardBg})` }}
      >
        <div className="dashboard-blur-overlay"></div>
      </div>

      {/* Top Bar */}
      <div className="dashboard-topbar">
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
                disabled={isLoading}
                className="sign-out-btn-dashboard"
                title="Sign Out"
              >
                {isLoading ? 'Signing out...' : 'Sign Out'}
              </button>
            </>
          )}
          <button 
            className="settings-icon-btn" 
            onClick={() => setShowSettings(true)}
            title="Settings"
          >
            <img src={settingsIcon} alt="Settings" className="settings-btn-icon" />
          </button>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="dashboard-container">
        {/* Search Bar */}
        <div className="dashboard-search">
          <SearchBar />
        </div>

        {/* Page Title */}
        <div className="dashboard-title-section">
          <h1 className="dashboard-title">Your Cities</h1>
          <p className="dashboard-subtitle">
            {favorites.length === 0 
              ? 'Search for a city to add it to your dashboard' 
              : `Tracking weather for ${favorites.length} ${favorites.length === 1 ? 'city' : 'cities'}`
            }
          </p>
        </div>

        {/* City Cards Grid */}
        {favorites.length === 0 ? (
          <div className="empty-dashboard">
            <div className="empty-icon">🌍</div>
            <h2>No Cities Added Yet</h2>
            <p>Search for a city above to start tracking weather</p>
          </div>
        ) : (
          <div className="city-cards-grid">
            {sortedFavorites.map((cityId) => (
              <CityWeatherCard 
                key={cityId} 
                cityId={cityId}
                temperatureUnit={temperatureUnit}
                isPinned={pinnedCities.includes(cityId)}
                onTogglePin={() => dispatch(togglePinned(cityId))}
                onClick={() => navigate(`/city/${encodeURIComponent(cityId)}`)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="settings-modal" onClick={() => setShowSettings(false)}>
          <div className="settings-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowSettings(false)}>✕</button>
            <SettingsPanel />
          </div>
        </div>
      )}
    </div>
  );
};

// City Weather Card Component
interface CityWeatherCardProps {
  cityId: string;
  temperatureUnit: 'celsius' | 'fahrenheit';
  isPinned: boolean;
  onTogglePin: () => void;
  onClick: () => void;
}

const CityWeatherCard = ({ cityId, temperatureUnit, isPinned, onTogglePin, onClick }: CityWeatherCardProps) => {
  const { data: weather, isLoading, error } = useGetCurrentWeatherQuery(cityId);

  const handlePinClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onTogglePin();
  };

  // Convert temperature based on unit
  const convertTemp = (tempC: number) => {
    return temperatureUnit === 'celsius' ? tempC : (tempC * 9/5) + 32;
  };

  if (isLoading) {
    return (
      <div className="city-card glass-card loading-card">
        <div className="loading-spinner">⏳</div>
        <p>Loading...</p>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="city-card glass-card error-card">
        <div className="error-icon">⚠️</div>
        <p>Failed to load weather</p>
      </div>
    );
  }

  return (
    <div className="city-card glass-card" onClick={onClick}>
      {/* City Header */}
      <div className="city-card-header">
        <div className="city-location">
          <h3 className="city-card-name">{weather.cityName}</h3>
          <p className="city-card-country">{weather.country}</p>
        </div>
        <div className="weather-icon-large">
          <img 
            src={getWeatherIcon(weather.current.conditionCode)} 
            alt={weather.current.condition}
            className="weather-icon-img"
          />
        </div>
      </div>

      {/* Temperature Display */}
      <div className="city-card-temp">
        <div className="temp-main">{Math.round(convertTemp(weather.current.temperature))}°{temperatureUnit === 'celsius' ? 'C' : 'F'}</div>
        <div className="temp-feels-like">
          Feels like {Math.round(convertTemp(weather.current.feelsLike))}°{temperatureUnit === 'celsius' ? 'C' : 'F'}
        </div>
      </div>

      {/* Weather Condition */}
      <div className="city-card-condition">
        {weather.current.condition}
      </div>

      {/* Quick Stats */}
      <div className="city-card-stats">
        <div className="stat-item">
          <img 
            src={raindropIcon} 
            alt="Humidity" 
            className="stat-icon stat-icon-img"
          />
          <span className="stat-value">{weather.current.humidity}%</span>
          <span className="stat-label">Humidity</span>
        </div>
        <div className="stat-item">
          <img 
            src={windyIcon} 
            alt="Wind" 
            className="stat-icon stat-icon-img"
          />
          <span className="stat-value">{Math.round(weather.current.windSpeed)} km/h</span>
          <span className="stat-label">Wind</span>
        </div>
        <div className="stat-item">
          <img 
            src={eyeIcon} 
            alt="Visibility" 
            className="stat-icon stat-icon-img"
          />
          <span className="stat-value">{weather.current.visibility} km</span>
          <span className="stat-label">Visibility</span>
        </div>
      </div>

      {/* Click Indicator */}
      <div className="card-footer">
        <button 
          className="favorite-heart-btn"
          onClick={handlePinClick}
          title={isPinned ? "Unpin from top" : "Pin to top"}
        >
          <img 
            src={heartIcon} 
            alt={isPinned ? "Pinned" : "Not pinned"} 
            className={`heart-icon ${isPinned ? 'heart-pinned' : ''}`}
          />
        </button>
        <span className="view-details">View Details →</span>
      </div>
    </div>
  );
};

// Helper function to get weather icon based on condition code
function getWeatherIcon(conditionCode: number): string {
  // Sunny/Clear
  if (conditionCode === 1000) return sunnyIcon;
  
  // Partly Cloudy
  if ([1003].includes(conditionCode)) return partiallyCloudyIcon;
  
  // Cloudy
  if ([1006, 1009].includes(conditionCode)) return cloudyIcon;
  
  // Overcast
  if ([1009].includes(conditionCode)) return cloudyClearIcon;
  
  // Mist/Fog
  if ([1030, 1135, 1147].includes(conditionCode)) return cloudyIcon;
  
  // Light Rain/Drizzle
  if ([1063, 1150, 1153, 1168, 1171, 1180, 1183].includes(conditionCode)) return drizzlingIcon;
  
  // Moderate/Heavy Rain
  if ([1186, 1189, 1192, 1195, 1240, 1243, 1246].includes(conditionCode)) return rainIcon;
  
  // Heavy Rain
  if ([1195, 1243, 1246].includes(conditionCode)) return heavyRainIcon;
  
  // Snow
  if ([1066, 1114, 1117, 1210, 1213, 1216, 1219, 1222, 1225, 1237, 1255, 1258, 1261, 1264].includes(conditionCode)) return snowIcon;
  
  // Thunderstorm
  if ([1087, 1273, 1276, 1279, 1282].includes(conditionCode)) return heavyThunderstormIcon;
  
  // Night (if you want to handle night separately)
  // This would require checking time of day
  
  // Default to partly cloudy
  return partiallyCloudyIcon;
}

export default Dashboard;
