import { useSelector } from 'react-redux';
import { memo, useMemo, useCallback } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { RootState } from '../store';
import type { HourlyForecast, DailyForecast } from '../types/weather.types';
import { convertTemperature } from '../utils/temperature';
import { formatTime, formatDate } from '../utils/date';
import './TemperatureChart.css';

interface TemperatureChartProps {
  hourlyData: HourlyForecast[];
  dailyData: DailyForecast[];
  dateRange: { start: Date; end: Date };
  timezone?: string;
}

interface ChartDataPoint {
  time: string;
  temperature: number;
  label: string;
}

const TemperatureChart = memo(({ hourlyData, dateRange, timezone }: TemperatureChartProps) => {
  const temperatureUnit = useSelector((state: RootState) => state.settings.temperatureUnit);

  // Filter data based on date range
  const filterByDateRange = useCallback((timestamp: number): boolean => {
    const date = new Date(timestamp * 1000);
    return date >= dateRange.start && date <= dateRange.end;
  }, [dateRange]);

  // Prepare chart data from hourly forecast - memoized
  const chartData: ChartDataPoint[] = useMemo(() => hourlyData
    .filter((hour) => filterByDateRange(hour.timestamp))
    .map((hour) => {
      const temp = convertTemperature(hour.temperature, 'celsius', temperatureUnit);
      const date = new Date(hour.timestamp * 1000);
      
      return {
        time: formatTime(date, timezone),
        temperature: Math.round(temp * 10) / 10,
        label: formatDate(date, 'short', timezone),
      };
    }), [hourlyData, filterByDateRange, temperatureUnit, timezone]);

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="temperature-tooltip">
          <p className="tooltip-label">{data.label}</p>
          <p className="tooltip-time">{data.time}</p>
          <p className="tooltip-temp">
            Temperature: {data.temperature}°{temperatureUnit === 'celsius' ? 'C' : 'F'}
          </p>
        </div>
      );
    }
    return null;
  };

  // Calculate min/max for Y-axis domain - memoized
  const { minTemp, maxTemp } = useMemo(() => {
    const temperatures = chartData.map((d) => d.temperature);
    return {
      minTemp: Math.floor(Math.min(...temperatures) - 2),
      maxTemp: Math.ceil(Math.max(...temperatures) + 2),
    };
  }, [chartData]);

  return (
    <div className="temperature-chart">
      <h4>Temperature Trends</h4>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <defs>
            <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ff6b6b" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#4ecdc4" stopOpacity={0.8} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
          <XAxis
            dataKey="time"
            stroke="rgba(255, 255, 255, 0.8)"
            tick={{ fontSize: 12, fill: 'rgba(255, 255, 255, 0.8)' }}
            interval="preserveStartEnd"
          />
          <YAxis
            stroke="rgba(255, 255, 255, 0.8)"
            tick={{ fontSize: 12, fill: 'rgba(255, 255, 255, 0.8)' }}
            domain={[minTemp, maxTemp]}
            label={{
              value: `Temperature (°${temperatureUnit === 'celsius' ? 'C' : 'F'})`,
              angle: -90,
              position: 'insideLeft',
              style: { fontSize: 12, fill: 'rgba(255, 255, 255, 0.8)' },
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: 14 }}
            iconType="line"
          />
          <Line
            type="monotone"
            dataKey="temperature"
            stroke="url(#tempGradient)"
            strokeWidth={3}
            dot={{ fill: '#ff6b6b', r: 4 }}
            activeDot={{ r: 6 }}
            name="Temperature"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
});

TemperatureChart.displayName = 'TemperatureChart';

export default TemperatureChart;
