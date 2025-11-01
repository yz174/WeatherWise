import { useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import type { ChartOptions } from 'chart.js';
import { Line } from 'react-chartjs-2';
import type { DailyForecast } from '../types/weather.types';
import './WeeklyForecastChart.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface WeeklyForecastChartProps {
  forecast: DailyForecast[];
}

function getDayName(index: number): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const today = new Date().getDay();
  return days[(today + index) % 7];
}

function getShortDayName(index: number): string {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date().getDay();
  return days[(today + index) % 7];
}

const WeeklyForecastChart = ({ forecast }: WeeklyForecastChartProps) => {
  const chartRef = useRef<ChartJS<'line'>>(null);

  // Prepare data for the chart
  const weekData = forecast.slice(0, 7);
  const labels = weekData.map((_, idx) => getShortDayName(idx));
  const temperatures = weekData.map((day) => Math.round((day.tempMax + day.tempMin) / 2));
  const maxTemps = weekData.map((day) => Math.round(day.tempMax));
  const minTemps = weekData.map((day) => Math.round(day.tempMin));

  const data = {
    labels,
    datasets: [
      {
        label: 'Average Temperature',
        data: temperatures,
        borderColor: 'rgba(255, 255, 255, 0.9)',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        pointBackgroundColor: 'rgba(255, 255, 255, 1)',
        pointBorderColor: 'rgba(255, 255, 255, 1)',
        pointHoverBackgroundColor: 'rgba(255, 255, 255, 1)',
        pointHoverBorderColor: 'rgba(255, 255, 255, 1)',
        pointRadius: 6,
        pointHoverRadius: 10,
        borderWidth: 3,
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        padding: 12,
        displayColors: false,
        callbacks: {
          title: (context) => {
            const index = context[0].dataIndex;
            return getDayName(index);
          },
          label: (context) => {
            const index = context.dataIndex;
            return [
              `Average: ${temperatures[index]}°`,
              `High: ${maxTemps[index]}°`,
              `Low: ${minTemps[index]}°`,
            ];
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.9)',
          font: {
            size: 14,
            weight: 500,
          },
        },
        border: {
          display: false,
        },
      },
      y: {
        display: false,
        grid: {
          display: false,
        },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
  };

  return (
    <div className="weekly-forecast-chart">
      <div className="chart-container">
        <Line ref={chartRef} data={data} options={options} />
      </div>
      <div className="temperature-labels">
        {weekData.map((day, idx) => (
          <div key={idx} className="temp-label-item">
            <div className="temp-value">{Math.round((day.tempMax + day.tempMin) / 2)}°</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeeklyForecastChart;
