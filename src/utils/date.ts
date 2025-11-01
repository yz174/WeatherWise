/**
 * Date formatting utilities
 */

/**
 * Format Unix timestamp to readable date string
 * @param timestamp Unix timestamp in seconds
 * @param format Format type
 * @param timezone IANA timezone identifier (e.g., "America/New_York")
 * @returns Formatted date string
 */
export function formatDate(
  timestamp: number | Date,
  format: 'short' | 'long' | 'time' | 'datetime' = 'short',
  timezone?: string
): string {
  const date = typeof timestamp === 'number' ? new Date(timestamp * 1000) : timestamp;
  const options: Intl.DateTimeFormatOptions = timezone ? { timeZone: timezone } : {};

  switch (format) {
    case 'short':
      // e.g., "Nov 1"
      return date.toLocaleDateString('en-US', {
        ...options,
        month: 'short',
        day: 'numeric',
      });

    case 'long':
      // e.g., "November 1, 2025"
      return date.toLocaleDateString('en-US', {
        ...options,
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

    case 'time':
      // e.g., "2:30 PM"
      return date.toLocaleTimeString('en-US', {
        ...options,
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });

    case 'datetime':
      // e.g., "Nov 1, 2:30 PM"
      return date.toLocaleDateString('en-US', {
        ...options,
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });

    default:
      return date.toLocaleDateString('en-US', options);
  }
}

/**
 * Format time from Date object or Unix timestamp
 * @param date Date object or Unix timestamp in seconds
 * @param timezone IANA timezone identifier (e.g., "America/New_York")
 * @returns Formatted time string (e.g., "2:30 PM")
 */
export function formatTime(date: Date | number, timezone?: string): string {
  const dateObj = typeof date === 'number' ? new Date(date * 1000) : date;
  const options: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  };
  
  if (timezone) {
    options.timeZone = timezone;
  }
  
  return dateObj.toLocaleTimeString('en-US', options);
}

/**
 * Format date string (YYYY-MM-DD) to readable format
 * @param dateString Date string in YYYY-MM-DD format
 * @param format Format type
 * @returns Formatted date string
 */
export function formatDateString(
  dateString: string,
  format: 'short' | 'long' | 'weekday' = 'short'
): string {
  const date = new Date(dateString);

  switch (format) {
    case 'short':
      // e.g., "Nov 1"
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });

    case 'long':
      // e.g., "November 1, 2025"
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

    case 'weekday':
      // e.g., "Monday"
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
      });

    default:
      return date.toLocaleDateString();
  }
}

/**
 * Get day of week from date string
 * @param dateString Date string in YYYY-MM-DD format
 * @param format 'short' for "Mon" or 'long' for "Monday"
 * @returns Day of week
 */
export function getDayOfWeek(
  dateString: string,
  format: 'short' | 'long' = 'short'
): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: format,
  });
}

/**
 * Format hour from timestamp
 * @param timestamp Unix timestamp in seconds
 * @param format '12h' or '24h'
 * @param timezone IANA timezone identifier (e.g., "America/New_York")
 * @returns Formatted hour string
 */
export function formatHour(
  timestamp: number,
  format: '12h' | '24h' = '12h',
  timezone?: string
): string {
  const date = new Date(timestamp * 1000);
  const options: Intl.DateTimeFormatOptions = timezone ? { timeZone: timezone } : {};

  if (format === '24h') {
    return date.toLocaleTimeString('en-US', {
      ...options,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  }

  return date.toLocaleTimeString('en-US', {
    ...options,
    hour: 'numeric',
    hour12: true,
  });
}

/**
 * Check if timestamp is today
 * @param timestamp Unix timestamp in seconds
 * @returns True if timestamp is today
 */
export function isToday(timestamp: number): boolean {
  const date = new Date(timestamp * 1000);
  const today = new Date();

  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

/**
 * Get relative time string (e.g., "2 minutes ago")
 * @param timestamp Unix timestamp in seconds
 * @returns Relative time string
 */
export function getRelativeTime(timestamp: number): string {
  const now = Date.now();
  const date = timestamp * 1000;
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) {
    return 'just now';
  } else if (diffMin < 60) {
    return `${diffMin} minute${diffMin !== 1 ? 's' : ''} ago`;
  } else if (diffHour < 24) {
    return `${diffHour} hour${diffHour !== 1 ? 's' : ''} ago`;
  } else {
    return `${diffDay} day${diffDay !== 1 ? 's' : ''} ago`;
  }
}

/**
 * Check if data is stale (older than specified seconds)
 * @param timestamp Unix timestamp in seconds
 * @param maxAgeSeconds Maximum age in seconds (default: 60)
 * @returns True if data is stale
 */
export function isStale(timestamp: number, maxAgeSeconds: number = 60): boolean {
  const now = Date.now();
  const date = timestamp * 1000;
  const ageSeconds = (now - date) / 1000;

  return ageSeconds > maxAgeSeconds;
}
