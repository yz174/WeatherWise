import { memo, useMemo } from 'react';
import { useAppSelector } from '../store/hooks';
import type { HourlyForecast as HourlyForecastType } from '../types/weather.types';
import { getTemperatureDisplay } from '../utils/temperature';
import { formatHour } from '../utils/date';
import { getWeatherEmoji } from '../utils/weather';
import './HourlyForecast.css';

interface HourlyForecastProps {
  hourlyForecasts: HourlyForecastType[];
  timezone?: string;
}

const HourlyForecast = memo(({ hourlyForecasts, timezone }: HourlyForecastProps) => {
  const temperatureUnit = useAppSelector((state) => state.settings.temperatureUnit);

  // Memoize next 24 hours calculation
  const next24Hours = useMemo(() => {
    if (!hourlyForecasts || hourlyForecasts.length === 0) return [];
    return hourlyForecasts.slice(0, 24);
  }, [hourlyForecasts]);

  if (!hourlyForecasts || hourlyForecasts.length === 0) {
    return (
      <div className="hourly-forecast">
        <h3>Hourly Forecast</h3>
        <p>No hourly forecast data available</p>
      </div>
    );
  }

  return (
    <div className="hourly-forecast">
      <h3>Hourly Forecast (Next 24 Hours)</h3>
      <div className="hourly-scroll-container">
        <div className="hourly-items">
          {next24Hours.map((hour, index) => (
            <div key={`${hour.timestamp}-${index}`} className="hourly-item">
              <div className="hourly-time">
                {formatHour(hour.timestamp, '12h', timezone)}
              </div>
              <div className="hourly-icon">
                {getWeatherEmoji(hour.conditionCode)}
              </div>
              <div className="hourly-temp">
                {getTemperatureDisplay(hour.temperature, temperatureUnit, 0)}
              </div>
              <div className="hourly-precipitation">
                💧 {hour.precipitationChance}%
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

HourlyForecast.displayName = 'HourlyForecast';

export default HourlyForecast;
