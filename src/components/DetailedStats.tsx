import { memo, useMemo } from 'react';
import { useAppSelector } from '../store/hooks';
import { getTemperatureDisplay } from '../utils/temperature';
import {
  formatPressure,
  formatVisibility,
  getUVIndexCategory,
  getVisibilityDescription,
} from '../utils/weather';
import './DetailedStats.css';

interface DetailedStatsProps {
  pressure: number;
  dewPoint: number;
  uvIndex: number;
  visibility: number;
  feelsLike: number;
}

const DetailedStats = memo(({
  pressure,
  dewPoint,
  uvIndex,
  visibility,
  feelsLike,
}: DetailedStatsProps) => {
  const temperatureUnit = useAppSelector((state) => state.settings.temperatureUnit);
  
  // Memoize expensive calculations
  const uvCategory = useMemo(() => getUVIndexCategory(uvIndex), [uvIndex]);
  const visibilityDesc = useMemo(() => getVisibilityDescription(visibility), [visibility]);
  const feelsLikeDisplay = useMemo(() => 
    getTemperatureDisplay(feelsLike, temperatureUnit, 1), 
    [feelsLike, temperatureUnit]
  );
  const dewPointDisplay = useMemo(() => 
    getTemperatureDisplay(dewPoint, temperatureUnit, 1), 
    [dewPoint, temperatureUnit]
  );
  const pressureDisplay = useMemo(() => formatPressure(pressure, 'mb'), [pressure]);
  const visibilityDisplay = useMemo(() => formatVisibility(visibility, 'km'), [visibility]);

  return (
    <div className="detailed-stats">
      <h3>Detailed Statistics</h3>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🌡️</div>
          <div className="stat-content">
            <div className="stat-label">Feels Like</div>
            <div className="stat-value">
              {feelsLikeDisplay}
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🔽</div>
          <div className="stat-content">
            <div className="stat-label">Pressure</div>
            <div className="stat-value">{pressureDisplay}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💧</div>
          <div className="stat-content">
            <div className="stat-label">Dew Point</div>
            <div className="stat-value">
              {dewPointDisplay}
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">☀️</div>
          <div className="stat-content">
            <div className="stat-label">UV Index</div>
            <div className="stat-value">
              {uvIndex.toFixed(1)}
              <span
                className="uv-category"
                style={{ color: uvCategory.color }}
              >
                {uvCategory.category}
              </span>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">👁️</div>
          <div className="stat-content">
            <div className="stat-label">Visibility</div>
            <div className="stat-value">
              {visibilityDisplay}
              <span className="visibility-desc">{visibilityDesc}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

DetailedStats.displayName = 'DetailedStats';

export default DetailedStats;
