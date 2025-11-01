/**
 * Temperature conversion utilities
 */

export type TemperatureUnit = 'celsius' | 'fahrenheit';

/**
 * Convert Celsius to Fahrenheit
 * @param celsius Temperature in Celsius
 * @returns Temperature in Fahrenheit
 */
export function celsiusToFahrenheit(celsius: number): number {
  return (celsius * 9) / 5 + 32;
}

/**
 * Convert Fahrenheit to Celsius
 * @param fahrenheit Temperature in Fahrenheit
 * @returns Temperature in Celsius
 */
export function fahrenheitToCelsius(fahrenheit: number): number {
  return ((fahrenheit - 32) * 5) / 9;
}

/**
 * Convert temperature to the specified unit
 * @param temperature Temperature value
 * @param fromUnit Source unit
 * @param toUnit Target unit
 * @returns Converted temperature
 */
export function convertTemperature(
  temperature: number,
  fromUnit: TemperatureUnit,
  toUnit: TemperatureUnit
): number {
  if (fromUnit === toUnit) {
    return temperature;
  }

  if (fromUnit === 'celsius' && toUnit === 'fahrenheit') {
    return celsiusToFahrenheit(temperature);
  }

  return fahrenheitToCelsius(temperature);
}

/**
 * Format temperature with unit symbol
 * @param temperature Temperature value
 * @param unit Temperature unit
 * @param decimals Number of decimal places (default: 1)
 * @returns Formatted temperature string (e.g., "23.5°C")
 */
export function formatTemperature(
  temperature: number,
  unit: TemperatureUnit,
  decimals: number = 1
): string {
  const symbol = unit === 'celsius' ? '°C' : '°F';
  return `${temperature.toFixed(decimals)}${symbol}`;
}

/**
 * Get temperature display value in the specified unit
 * Assumes input temperature is in Celsius
 * @param temperatureCelsius Temperature in Celsius
 * @param targetUnit Target unit for display
 * @param decimals Number of decimal places (default: 1)
 * @returns Formatted temperature string
 */
export function getTemperatureDisplay(
  temperatureCelsius: number,
  targetUnit: TemperatureUnit,
  decimals: number = 1
): string {
  const converted = convertTemperature(temperatureCelsius, 'celsius', targetUnit);
  return formatTemperature(converted, targetUnit, decimals);
}
