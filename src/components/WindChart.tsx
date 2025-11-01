import { memo, useMemo, useCallback } from 'react';
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Scatter,
} from 'recharts';
import type { HourlyForecast } from '../types/weather.types';
import { formatTime, formatDate } from '../utils/date';
import './WindChart.css';

interface WindChartProps {
  hourlyData: HourlyForecast[];
  dateRange: { start: Date; end: Date };
}

interface ChartDataPoint {
  time: string;
  speed: number;
  direction: number;
  directionLabel: string;
  label: string;
}

// Convert wind direction degrees to compass direction
const getWindDirection = (degrees: number): string => {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
};

const WindChart = memo(({ hourlyData, dateRange }: WindChartProps) => {
  // Filter data based on date range
  const filterByDateRange = useCallback((timestamp: number): boolean => {
    const date = new Date(timestamp * 1000);
    return date >= dateRange.start && date <= dateRange.end;
  }, [dateRange]);

  // Prepare chart data from hourly forecast - memoized
  const chartData: ChartDataPoint[] = useMemo(() => hourlyData
    .filter((hour) => filterByDateRange(hour.timestamp))
    .map((hour) => {
      const date = new Date(hour.timestamp * 1000);
      
      return {
        time: formatTime(date),
        speed: Math.round(hour.windSpeed * 10) / 10,
        direction: hour.windDirection,
        directionLabel: getWindDirection(hour.windDirection),
        label: formatDate(date),
      };
    }), [hourlyData, filterByDateRange]);

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="wind-tooltip">
          <p className="tooltip-label">{data.label}</p>
          <p className="tooltip-time">{data.time}</p>
          <p className="tooltip-speed">
            Speed: {data.speed} km/h
          </p>
          <p className="tooltip-direction">
            Direction: {data.directionLabel} ({data.direction}°)
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom wind direction indicator
  const WindDirectionDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (!cx || !cy) return null;

    // Calculate arrow rotation based on wind direction
    const rotation = payload.direction;

    return (
      <g transform={`translate(${cx},${cy})`}>
        <circle r={4} fill="#6c5ce7" />
        <g transform={`rotate(${rotation})`}>
          <path
            d="M 0,-8 L 3,0 L 0,2 L -3,0 Z"
            fill="#6c5ce7"
            stroke="#fff"
            strokeWidth={1}
          />
        </g>
      </g>
    );
  };

  return (
    <div className="wind-chart">
      <h4>Wind Speed & Direction</h4>
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis
            dataKey="time"
            stroke="#666"
            tick={{ fontSize: 12 }}
            interval="preserveStartEnd"
          />
          <YAxis
            stroke="#666"
            tick={{ fontSize: 12 }}
            label={{
              value: 'Wind Speed (km/h)',
              angle: -90,
              position: 'insideLeft',
              style: { fontSize: 12 },
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: 14 }}
            iconType="line"
          />
          <Line
            type="monotone"
            dataKey="speed"
            stroke="#6c5ce7"
            strokeWidth={2}
            dot={false}
            name="Wind Speed"
          />
          <Scatter
            dataKey="speed"
            fill="#6c5ce7"
            shape={<WindDirectionDot />}
            name="Wind Direction"
          />
        </ComposedChart>
      </ResponsiveContainer>
      <div className="wind-legend">
        <span className="legend-item">
          <span className="arrow-icon">↑</span> Arrow points in wind direction
        </span>
      </div>
    </div>
  );
});

WindChart.displayName = 'WindChart';

export default WindChart;
