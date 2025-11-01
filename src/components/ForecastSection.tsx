import { memo } from 'react';
import { useAppSelector } from '../store/hooks';
import type { DailyForecast } from '../types/weather.types';
import { getTemperatureDisplay } from '../utils/temperature';
import { getDayOfWeek, formatDateString } from '../utils/date';
import { getWeatherEmoji } from '../utils/weather';
import './ForecastSection.css';

interface ForecastSectionProps {
  dailyForecasts: DailyForecast[];
  compact?: boolean;
}

const ForecastSection = memo(({ dailyForecasts, compact = false }: ForecastSectionProps) => {
  const temperatureUnit = useAppSelector((state) => state.settings.temperatureUnit);

  if (!dailyForecasts || dailyForecasts.length === 0) {
    return (
      <div className={`forecast-section ${compact ? 'forecast-compact' : ''}`}>
        {!compact && <h3>7-Day Forecast</h3>}
        <p>No forecast data available</p>
      </div>
    );
  }

  return (
    <div className={`forecast-section ${compact ? 'forecast-compact' : ''}`}>
      {!compact && <h3>7-Day Forecast</h3>}
      <div className={`forecast-cards ${compact ? 'forecast-cards-compact' : ''}`}>
        {dailyForecasts.map((day) => (
          <div key={day.date} className={`forecast-card ${compact ? 'forecast-card-compact' : ''}`}>
            <div className="forecast-day">
              <div className="day-name">{getDayOfWeek(day.date, 'short')}</div>
              <div className="day-date">{formatDateString(day.date, 'short')}</div>
            </div>
            <div className="forecast-icon">
              {getWeatherEmoji(day.conditionCode)}
            </div>
            <div className="forecast-condition">{day.condition}</div>
            <div className="forecast-temps">
              <span className="temp-high">
                {getTemperatureDisplay(day.tempMax, temperatureUnit, 0)}
              </span>
              <span className="temp-divider">/</span>
              <span className="temp-low">
                {getTemperatureDisplay(day.tempMin, temperatureUnit, 0)}
              </span>
            </div>
            <div className="forecast-precipitation">
              💧 {day.precipitationChance}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

ForecastSection.displayName = 'ForecastSection';

export default ForecastSection;
