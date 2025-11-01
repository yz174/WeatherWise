import { useState, useCallback, lazy, Suspense } from 'react';
import type { ForecastData } from '../types/weather.types';
import './ChartsSection.css';

// Lazy load chart components for better performance
const TemperatureChart = lazy(() => import('./TemperatureChart'));
const PrecipitationChart = lazy(() => import('./PrecipitationChart'));

interface ChartsSectionProps {
  forecastData: ForecastData;
  timezone?: string;
}

const ChartsSection = ({ forecastData, timezone }: ChartsSectionProps) => {
  // Date range state for filtering chart data
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>({
    start: new Date(),
    end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
  });

  const handleDateRangeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const days = parseInt(e.target.value);
    setDateRange({
      start: new Date(),
      end: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
    });
  }, []);

  return (
    <div className="charts-section">
      <h3>Weather Trends</h3>
      
      <div className="date-range-selector">
        <label>
          Date Range:
          <select
            value="7"
            onChange={handleDateRangeChange}
          >
            <option value="1">Next 24 Hours</option>
            <option value="3">Next 3 Days</option>
            <option value="7">Next 7 Days</option>
          </select>
        </label>
      </div>

      <div className="charts-container">
        <Suspense fallback={
          <div style={{ 
            padding: '40px', 
            textAlign: 'center', 
            backgroundColor: '#fff', 
            borderRadius: '8px',
            margin: '16px 0'
          }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>📊</div>
            <p style={{ color: '#666' }}>Loading chart...</p>
          </div>
        }>
          <TemperatureChart
            hourlyData={forecastData.hourly}
            dailyData={forecastData.daily}
            dateRange={dateRange}
            timezone={timezone}
          />
        </Suspense>
        
        <Suspense fallback={
          <div style={{ 
            padding: '40px', 
            textAlign: 'center', 
            backgroundColor: '#fff', 
            borderRadius: '8px',
            margin: '16px 0'
          }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>📊</div>
            <p style={{ color: '#666' }}>Loading chart...</p>
          </div>
        }>
          <PrecipitationChart
            dailyData={forecastData.daily}
            dateRange={dateRange}
          />
        </Suspense>
      </div>
    </div>
  );
};

export default ChartsSection;
