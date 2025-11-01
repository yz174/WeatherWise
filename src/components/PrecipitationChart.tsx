import { memo, useMemo, useCallback } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { DailyForecast } from '../types/weather.types';
import { formatDate } from '../utils/date';
import './PrecipitationChart.css';

interface PrecipitationChartProps {
  dailyData: DailyForecast[];
  dateRange: { start: Date; end: Date };
}

interface ChartDataPoint {
  date: string;
  amount: number;
  probability: number;
  label: string;
}

const PrecipitationChart = memo(({ dailyData, dateRange }: PrecipitationChartProps) => {
  // Filter data based on date range
  const filterByDateRange = useCallback((dateStr: string): boolean => {
    const date = new Date(dateStr);
    return date >= dateRange.start && date <= dateRange.end;
  }, [dateRange]);

  // Prepare chart data from daily forecast - memoized
  const chartData: ChartDataPoint[] = useMemo(() => dailyData
    .filter((day) => filterByDateRange(day.date))
    .map((day) => {
      const date = new Date(day.date);
      
      return {
        date: formatDate(date, 'short'),
        amount: Math.round(day.precipitationAmount * 10) / 10,
        probability: day.precipitationChance,
        label: formatDate(date),
      };
    }), [dailyData, filterByDateRange]);

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="precipitation-tooltip">
          <p className="tooltip-label">{data.label}</p>
          <p className="tooltip-amount">
            Amount: {data.amount} mm
          </p>
          <p className="tooltip-probability">
            Probability: {data.probability}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="precipitation-chart">
      <h4>Precipitation Forecast</h4>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
          <XAxis
            dataKey="date"
            stroke="rgba(255, 255, 255, 0.8)"
            tick={{ fontSize: 12, fill: 'rgba(255, 255, 255, 0.8)' }}
          />
          <YAxis
            yAxisId="left"
            stroke="rgba(255, 255, 255, 0.8)"
            tick={{ fontSize: 12, fill: 'rgba(255, 255, 255, 0.8)' }}
            label={{
              value: 'Amount (mm)',
              angle: -90,
              position: 'insideLeft',
              style: { fontSize: 12, fill: 'rgba(255, 255, 255, 0.8)' },
            }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            stroke="rgba(255, 255, 255, 0.8)"
            tick={{ fontSize: 12, fill: 'rgba(255, 255, 255, 0.8)' }}
            domain={[0, 100]}
            label={{
              value: 'Probability (%)',
              angle: 90,
              position: 'insideRight',
              style: { fontSize: 12, fill: 'rgba(255, 255, 255, 0.8)' },
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: 14 }}
            iconType="rect"
          />
          <Bar
            yAxisId="left"
            dataKey="amount"
            fill="#4ecdc4"
            name="Precipitation Amount"
            radius={[8, 8, 0, 0]}
          />
          <Bar
            yAxisId="right"
            dataKey="probability"
            fill="#95e1d3"
            name="Probability"
            radius={[8, 8, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
});

PrecipitationChart.displayName = 'PrecipitationChart';

export default PrecipitationChart;
