import { memo, useMemo, useRef, useEffect } from 'react';
import { getUVIndexCategory } from '../utils/weather';
import type { CurrentWeather, HourlyForecast } from '../types/weather.types';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { getSunrise, getSunset } from 'sunrise-sunset-js';
import './TodaysHighlights.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  Filler,
  Tooltip,
  Legend
);



// Mini Wind Chart Component - Memoized
interface WindChartData {
  time: string;
  speed: number;
}

const MiniWindChart = memo(({ windData, chartId }: { windData: WindChartData[]; chartId: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<ChartJS<'line'> | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Destroy existing chart if it exists
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
      chartInstanceRef.current = null;
    }

    // Get all chart instances and destroy any that might be using this canvas
    const existingChart = ChartJS.getChart(canvasRef.current);
    if (existingChart) {
      existingChart.destroy();
    }

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // Create new chart
    chartInstanceRef.current = new ChartJS(ctx, {
      type: 'line',
      data: {
        labels: windData.map(d => d.time),
        datasets: [
          {
            data: windData.map(d => d.speed),
            borderColor: 'rgba(100, 200, 255, 0.8)',
            backgroundColor: 'rgba(100, 200, 255, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 4,
            pointBackgroundColor: 'rgba(100, 200, 255, 1)',
            pointBorderColor: 'rgba(255, 255, 255, 0.8)',
            pointBorderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            enabled: true,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 8,
            displayColors: false,
            callbacks: {
              label: (context) => `${(context.parsed.y ?? 0).toFixed(1)} km/h`,
            },
          },
        },
        scales: {
          x: {
            display: true,
            grid: {
              display: false,
            },
            border: {
              display: false,
            },
            ticks: {
              color: 'rgba(255, 255, 255, 0.5)',
              font: {
                size: 8,
              },
              maxRotation: 0,
              autoSkip: true,
              maxTicksLimit: 4,
            },
          },
          y: {
            display: true,
            position: 'right',
            grid: {
              display: true,
              color: 'rgba(255, 255, 255, 0.05)',
            },
            border: {
              display: false,
            },
            ticks: {
              color: 'rgba(255, 255, 255, 0.5)',
              font: {
                size: 8,
              },
              maxTicksLimit: 4,
              callback: (value) => `${value}`,
            },
          },
        },
        interaction: {
          intersect: false,
          mode: 'index',
        },
      },
    });

    // Cleanup function
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [windData, chartId]);

  return <canvas ref={canvasRef} id={chartId} />;
}, (prevProps, nextProps) => {
  // Custom comparison - only re-render if data actually changed
  return prevProps.chartId === nextProps.chartId && 
         JSON.stringify(prevProps.windData) === JSON.stringify(nextProps.windData);
});

MiniWindChart.displayName = 'MiniWindChart';

// Helper function to format time
const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
};

// Helper function to calculate time difference
const getTimeDifference = (ms: number): string => {
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
};

// Sunrise Sunset Chart Component using sunrise-sunset-js
const SunriseSunsetChart = memo(({ latitude, longitude }: { latitude: number; longitude: number }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<ChartJS<'line'> | null>(null);

  // Calculate sun data using sunrise-sunset-js
  const sunData = useMemo(() => {
    const now = new Date();
    const sunrise = getSunrise(latitude, longitude, now);
    const sunset = getSunset(latitude, longitude, now);
    
    // Generate data points for 24 hours showing daylight
    const dataPoints: { time: string; value: number }[] = [];
    const labels: string[] = [];
    
    // Create hourly data points
    for (let hour = 0; hour < 24; hour++) {
      const time = new Date(now);
      time.setHours(hour, 0, 0, 0);
      
      const timeMs = time.getTime();
      const sunriseMs = sunrise.getTime();
      const sunsetMs = sunset.getTime();
      
      // Determine if this hour is during daylight
      let value = 0;
      if (timeMs >= sunriseMs && timeMs <= sunsetMs) {
        // Calculate a bell curve for daylight intensity
        const totalDaylight = sunsetMs - sunriseMs;
        const elapsed = timeMs - sunriseMs;
        const progress = elapsed / totalDaylight;
        
        // Create a smooth curve (sine wave for natural sun path)
        value = Math.sin(progress * Math.PI) * 100;
      }
      
      dataPoints.push({ time: time.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true }), value });
      labels.push(time.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true }));
    }
    
    const totalDaylight = sunset.getTime() - sunrise.getTime();
    const daylightDuration = getTimeDifference(totalDaylight);
    
    return {
      dataPoints,
      labels,
      sunriseTime: formatTime(sunrise),
      sunsetTime: formatTime(sunset),
      daylightDuration,
    };
  }, [latitude, longitude]);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Destroy existing chart
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
      chartInstanceRef.current = null;
    }

    const existingChart = ChartJS.getChart(canvasRef.current);
    if (existingChart) {
      existingChart.destroy();
    }

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // Create vertical gradient for daylight (yellow at top, orange at bottom)
    const gradient = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);
    gradient.addColorStop(0, 'rgba(255, 215, 0, 0.9)');
    gradient.addColorStop(0.4, 'rgba(255, 180, 50, 0.8)');
    gradient.addColorStop(1, 'rgba(255, 120, 80, 0.7)');

    // Create new chart
    chartInstanceRef.current = new ChartJS(ctx, {
      type: 'line',
      data: {
        labels: sunData.labels,
        datasets: [
          {
            label: 'Daylight',
            data: sunData.dataPoints.map(d => d.value),
            borderColor: 'rgba(255, 215, 0, 1)',
            backgroundColor: gradient,
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false, // Disable all animations for static rendering
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            enabled: false,
          },
        },
        scales: {
          x: {
            display: true,
            grid: {
              display: false,
            },
            border: {
              display: false,
            },
            ticks: {
              color: 'rgba(255, 255, 255, 0.5)',
              font: {
                size: 9,
              },
              maxRotation: 0,
              autoSkip: true,
              maxTicksLimit: 7,
            },
          },
          y: {
            display: false,
            grid: {
              display: false,
            },
            min: 0,
            max: 100,
          },
        },
        interaction: {
          intersect: false,
          mode: 'index',
        },
      },
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [sunData]);

  return (
    <div className="sun-chart-container">
      <canvas ref={canvasRef} />
      <div className="sun-info">
        <div className="sun-info-item">
          <span className="info-label">☀️ Sunrise:</span>
          <span className="info-value">{sunData.sunriseTime}</span>
        </div>
        <div className="sun-info-item">
          <span className="info-label">🌅 Sunset:</span>
          <span className="info-value">{sunData.sunsetTime}</span>
        </div>
        <div className="sun-info-item">
          <span className="info-label">Daylight:</span>
          <span className="info-value">{sunData.daylightDuration}</span>
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  return Math.abs(prevProps.latitude - nextProps.latitude) < 0.01 && 
         Math.abs(prevProps.longitude - nextProps.longitude) < 0.01;
});

SunriseSunsetChart.displayName = 'SunriseSunsetChart';

interface TodaysHighlightsProps {
  currentWeather: CurrentWeather;
  hourlyData: HourlyForecast[];
  timezone?: string;
}

const TodaysHighlights = memo(({ currentWeather, hourlyData, timezone }: TodaysHighlightsProps) => {
  // Get recent wind data for mini chart with time labels - memoized
  const recentWindData = useMemo(() => 
    hourlyData.slice(0, 12).map(h => ({
      time: new Date(h.timestamp * 1000).toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        hour12: true,
        timeZone: timezone
      }),
      speed: h.windSpeed,
    })),
    [hourlyData, timezone]
  );

  // UV Index category - memoized
  const uvCategory = useMemo(() => 
    getUVIndexCategory(currentWeather.current.uvIndex),
    [currentWeather.current.uvIndex]
  );

  // Memoize frequently accessed values
  const { windSpeed, uvIndex, humidity, visibility, feelsLike, temperature, dewPoint } = useMemo(() => ({
    windSpeed: currentWeather.current.windSpeed,
    uvIndex: currentWeather.current.uvIndex,
    humidity: currentWeather.current.humidity,
    visibility: currentWeather.current.visibility,
    feelsLike: currentWeather.current.feelsLike,
    temperature: currentWeather.current.temperature,
    dewPoint: currentWeather.current.dewPoint,
  }), [currentWeather.current]);

  // Memoize coordinates
  const coordinates = useMemo(() => ({
    lat: currentWeather.coordinates.lat,
    lon: currentWeather.coordinates.lon,
  }), [currentWeather.coordinates]);

  // Memoize chart ID
  const chartId = useMemo(() => `wind-chart-${currentWeather.cityId}`, [currentWeather.cityId]);

  return (
    <div className="todays-highlights">
      <h2 className="highlights-title">Today's Highlight</h2>
      
      <div className="highlights-grid">
        {/* Wind Status Card */}
        <div className="highlight-card wind-card">
          <h3 className="card-title">Wind Status</h3>
          <div className="card-content">
            <div className="wind-speed-display">
              <span className="wind-value">{windSpeed.toFixed(2)}</span>
              <span className="wind-unit">km/h</span>
            </div>
            
            {/* Mini Wind Chart */}
            <div className="mini-wind-chart">
              <MiniWindChart 
                windData={recentWindData} 
                chartId={chartId}
              />
            </div>
          </div>
        </div>

        {/* UV Index Card */}
        <div className="highlight-card uv-card">
          <h3 className="card-title">UV Index</h3>
          <div className="card-content">
            <div className="uv-gauge">
              <svg viewBox="0 0 200 120" className="gauge-svg">
                {/* Background arc */}
                <path
                  d="M 30,100 A 70,70 0 0,1 170,100"
                  fill="none"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="20"
                  strokeLinecap="round"
                />
                
                {/* Progress arc */}
                <path
                  d="M 30,100 A 70,70 0 0,1 170,100"
                  fill="none"
                  stroke={uvCategory.color}
                  strokeWidth="20"
                  strokeLinecap="round"
                  strokeDasharray={`${(uvIndex / 11) * 220} 220`}
                />
                
                {/* Center value */}
                <text
                  x="100"
                  y="90"
                  textAnchor="middle"
                  fill="white"
                  fontSize="36"
                  fontWeight="600"
                >
                  {uvIndex.toFixed(2)}
                </text>
                <text
                  x="100"
                  y="110"
                  textAnchor="middle"
                  fill="rgba(255,255,255,0.7)"
                  fontSize="14"
                >
                  {uvCategory.category}
                </text>
              </svg>
            </div>
          </div>
        </div>

        {/* Sunrise & Sunset Card */}
        <div className="highlight-card sunrise-card">
          <h3 className="card-title">Sunrise & Sunset</h3>
          <div className="card-content">
            <SunriseSunsetChart 
              latitude={coordinates.lat} 
              longitude={coordinates.lon} 
            />
          </div>
        </div>
      </div>
    </div>
  );
});

TodaysHighlights.displayName = 'TodaysHighlights';

export default TodaysHighlights;
