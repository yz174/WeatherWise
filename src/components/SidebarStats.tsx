import { memo } from 'react';
import { useAppSelector } from '../store/hooks';
import type { CurrentWeather } from '../types/weather.types';
import './SidebarStats.css';

interface SidebarStatsProps {
  currentWeather: CurrentWeather;
}

const SidebarStats = memo(({ currentWeather }: SidebarStatsProps) => {
  const { humidity, visibility, feelsLike, temperature, dewPoint } = currentWeather.current;
  const temperatureUnit = useAppSelector((state) => state.settings.temperatureUnit);
  
  // Convert temperature based on unit
  const convertTemp = (tempC: number) => {
    return temperatureUnit === 'celsius' ? tempC : (tempC * 9/5) + 32;
  };

  return (
    <div className="sidebar-stats">
      {/* Humidity Card */}
      <div className="sidebar-stat-card">
        <h3 className="sidebar-stat-title">Humidity</h3>
        <div className="sidebar-stat-content">
          <div className="humidity-layout-sidebar">
            <div className="humidity-value-section-sidebar">
              <span className="humidity-value-sidebar">{humidity}</span>
              <span className="humidity-unit-sidebar">%</span>
            </div>
            <div className="humidity-info-section-sidebar">
              <img src="/raindrops.png" alt="Humidity" className="humidity-icon-sidebar" />
              <div className="humidity-dew-text-sidebar">
                Dew point: {Math.round(convertTemp(dewPoint))}°{temperatureUnit === 'celsius' ? 'C' : 'F'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Visibility Card */}
      <div className="sidebar-stat-card">
        <h3 className="sidebar-stat-title">Visibility</h3>
        <div className="sidebar-stat-content">
          <div className="visibility-layout-sidebar">
            <div className="visibility-value-section-sidebar">
              <span className="visibility-value-sidebar">{visibility.toFixed(1)}</span>
              <span className="visibility-unit-sidebar">km</span>
            </div>
            <div className="visibility-info-section-sidebar">
              <div className="visibility-icon-circle-sidebar">
                <img src="/eye.png" alt="Visibility" className="visibility-icon-sidebar" />
              </div>
              <div className="visibility-status-text-sidebar">
                {visibility < 5 ? 'Haze' : 'Clear'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feels Like Card */}
      <div className="sidebar-stat-card">
        <h3 className="sidebar-stat-title">Feels Like</h3>
        <div className="sidebar-stat-content">
          <div className="feels-like-layout-sidebar">
            <div className="feels-like-value-section-sidebar">
              <img src="/temperature-high.png" alt="Temperature" className="feels-like-icon-sidebar" />
              <span className="feels-like-value-sidebar">{Math.round(convertTemp(feelsLike))}°{temperatureUnit === 'celsius' ? 'C' : 'F'}</span>
            </div>
            <div className="feels-like-info-section-sidebar">
              <div className="feels-like-status-text-sidebar">
                {feelsLike > temperature ? 'Feels hotter' : 'Feels cooler'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

SidebarStats.displayName = 'SidebarStats';

export default SidebarStats;
