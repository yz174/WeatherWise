/**
 * Weather utilities for icon mapping and condition helpers
 */

/**
 * Weather condition code ranges (WeatherAPI.com codes)
 * Reference: https://www.weatherapi.com/docs/weather_conditions.json
 */

export type WeatherIconType =
  | 'sunny'
  | 'clear-night'
  | 'partly-cloudy'
  | 'cloudy'
  | 'overcast'
  | 'mist'
  | 'rain'
  | 'heavy-rain'
  | 'snow'
  | 'heavy-snow'
  | 'sleet'
  | 'thunderstorm'
  | 'fog'
  | 'blizzard'
  | 'unknown';

/**
 * Map weather condition code to icon type
 * @param conditionCode Weather condition code from API
 * @param isDay Whether it's daytime (1) or night (0)
 * @returns Icon type identifier
 */
export function getWeatherIcon(
  conditionCode: number,
  isDay: number = 1
): WeatherIconType {
  // Sunny / Clear
  if (conditionCode === 1000) {
    return isDay ? 'sunny' : 'clear-night';
  }

  // Partly cloudy
  if (conditionCode === 1003) {
    return 'partly-cloudy';
  }

  // Cloudy
  if (conditionCode === 1006) {
    return 'cloudy';
  }

  // Overcast
  if (conditionCode === 1009) {
    return 'overcast';
  }

  // Mist
  if (conditionCode === 1030) {
    return 'mist';
  }

  // Patchy rain possible, Light rain, Moderate rain
  if ([1063, 1150, 1153, 1180, 1183, 1186, 1189, 1192, 1240, 1243].includes(conditionCode)) {
    return 'rain';
  }

  // Heavy rain, Torrential rain
  if ([1195, 1246].includes(conditionCode)) {
    return 'heavy-rain';
  }

  // Patchy snow, Light snow, Moderate snow
  if ([1066, 1114, 1210, 1213, 1216, 1219, 1222, 1255].includes(conditionCode)) {
    return 'snow';
  }

  // Heavy snow, Blowing snow
  if ([1117, 1225, 1258].includes(conditionCode)) {
    return 'heavy-snow';
  }

  // Sleet, Ice pellets
  if ([1069, 1072, 1168, 1171, 1198, 1201, 1204, 1207, 1237, 1249, 1252, 1261, 1264].includes(conditionCode)) {
    return 'sleet';
  }

  // Thunderstorm
  if ([1087, 1273, 1276, 1279, 1282].includes(conditionCode)) {
    return 'thunderstorm';
  }

  // Fog, Freezing fog
  if ([1135, 1147].includes(conditionCode)) {
    return 'fog';
  }

  // Blizzard
  if (conditionCode === 1117) {
    return 'blizzard';
  }

  return 'unknown';
}

/**
 * Get emoji representation of weather condition
 * @param conditionCode Weather condition code
 * @param isDay Whether it's daytime
 * @returns Weather emoji
 */
export function getWeatherEmoji(conditionCode: number, isDay: number = 1): string {
  const iconType = getWeatherIcon(conditionCode, isDay);

  const emojiMap: Record<WeatherIconType, string> = {
    'sunny': '☀️',
    'clear-night': '🌙',
    'partly-cloudy': '⛅',
    'cloudy': '☁️',
    'overcast': '☁️',
    'mist': '🌫️',
    'rain': '🌧️',
    'heavy-rain': '⛈️',
    'snow': '🌨️',
    'heavy-snow': '❄️',
    'sleet': '🌨️',
    'thunderstorm': '⛈️',
    'fog': '🌫️',
    'blizzard': '❄️',
    'unknown': '🌡️',
  };

  return emojiMap[iconType];
}

/**
 * Get wind direction from degrees
 * @param degrees Wind direction in degrees (0-360)
 * @returns Cardinal direction (e.g., "N", "NE", "E")
 */
export function getWindDirection(degrees: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
}

/**
 * Get wind direction arrow
 * @param degrees Wind direction in degrees (0-360)
 * @returns Arrow character pointing in wind direction
 */
export function getWindDirectionArrow(degrees: number): string {
  const arrows = ['↓', '↙', '←', '↖', '↑', '↗', '→', '↘'];
  const index = Math.round(degrees / 45) % 8;
  return arrows[index];
}

/**
 * Get UV index category
 * @param uvIndex UV index value
 * @returns Category and color
 */
export function getUVIndexCategory(uvIndex: number): {
  category: string;
  color: string;
} {
  if (uvIndex <= 2) {
    return { category: 'Low', color: 'green' };
  } else if (uvIndex <= 5) {
    return { category: 'Moderate', color: 'yellow' };
  } else if (uvIndex <= 7) {
    return { category: 'High', color: 'orange' };
  } else if (uvIndex <= 10) {
    return { category: 'Very High', color: 'red' };
  } else {
    return { category: 'Extreme', color: 'purple' };
  }
}

/**
 * Get visibility description
 * @param visibilityKm Visibility in kilometers
 * @returns Description of visibility
 */
export function getVisibilityDescription(visibilityKm: number): string {
  if (visibilityKm >= 10) {
    return 'Excellent';
  } else if (visibilityKm >= 5) {
    return 'Good';
  } else if (visibilityKm >= 2) {
    return 'Moderate';
  } else if (visibilityKm >= 1) {
    return 'Poor';
  } else {
    return 'Very Poor';
  }
}

/**
 * Get humidity comfort level
 * @param humidity Humidity percentage
 * @returns Comfort level description
 */
export function getHumidityComfort(humidity: number): string {
  if (humidity < 30) {
    return 'Dry';
  } else if (humidity < 60) {
    return 'Comfortable';
  } else if (humidity < 80) {
    return 'Humid';
  } else {
    return 'Very Humid';
  }
}

/**
 * Get precipitation intensity description
 * @param precipitationMm Precipitation in millimeters
 * @returns Intensity description
 */
export function getPrecipitationIntensity(precipitationMm: number): string {
  if (precipitationMm === 0) {
    return 'None';
  } else if (precipitationMm < 2.5) {
    return 'Light';
  } else if (precipitationMm < 10) {
    return 'Moderate';
  } else if (precipitationMm < 50) {
    return 'Heavy';
  } else {
    return 'Violent';
  }
}

/**
 * Get wind speed description
 * @param windSpeedKph Wind speed in km/h
 * @returns Wind description
 */
export function getWindSpeedDescription(windSpeedKph: number): string {
  if (windSpeedKph < 1) {
    return 'Calm';
  } else if (windSpeedKph < 12) {
    return 'Light';
  } else if (windSpeedKph < 29) {
    return 'Moderate';
  } else if (windSpeedKph < 39) {
    return 'Fresh';
  } else if (windSpeedKph < 50) {
    return 'Strong';
  } else if (windSpeedKph < 62) {
    return 'Very Strong';
  } else if (windSpeedKph < 75) {
    return 'Gale';
  } else if (windSpeedKph < 89) {
    return 'Severe Gale';
  } else if (windSpeedKph < 103) {
    return 'Storm';
  } else if (windSpeedKph < 118) {
    return 'Violent Storm';
  } else {
    return 'Hurricane';
  }
}

/**
 * Format pressure value
 * @param pressureMb Pressure in millibars
 * @param unit 'mb' or 'inHg'
 * @returns Formatted pressure string
 */
export function formatPressure(
  pressureMb: number,
  unit: 'mb' | 'inHg' = 'mb'
): string {
  if (unit === 'inHg') {
    const inHg = pressureMb * 0.02953;
    return `${inHg.toFixed(2)} inHg`;
  }
  return `${pressureMb.toFixed(0)} mb`;
}

/**
 * Format wind speed
 * @param windSpeedKph Wind speed in km/h
 * @param unit 'kph', 'mph', or 'ms'
 * @returns Formatted wind speed string
 */
export function formatWindSpeed(
  windSpeedKph: number,
  unit: 'kph' | 'mph' | 'ms' = 'kph'
): string {
  if (unit === 'mph') {
    const mph = windSpeedKph * 0.621371;
    return `${mph.toFixed(1)} mph`;
  } else if (unit === 'ms') {
    const ms = windSpeedKph / 3.6;
    return `${ms.toFixed(1)} m/s`;
  }
  return `${windSpeedKph.toFixed(1)} km/h`;
}

/**
 * Format visibility
 * @param visibilityKm Visibility in kilometers
 * @param unit 'km' or 'mi'
 * @returns Formatted visibility string
 */
export function formatVisibility(
  visibilityKm: number,
  unit: 'km' | 'mi' = 'km'
): string {
  if (unit === 'mi') {
    const miles = visibilityKm * 0.621371;
    return `${miles.toFixed(1)} mi`;
  }
  return `${visibilityKm.toFixed(1)} km`;
}
