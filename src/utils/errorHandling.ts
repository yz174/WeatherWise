import type { SerializedError } from '@reduxjs/toolkit';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';

export type ApiErrorType =
  | 'network'
  | 'rate_limit'
  | 'not_found'
  | 'unauthorized'
  | 'server_error'
  | 'unknown';

export interface ErrorInfo {
  type: ApiErrorType;
  message: string;
  canRetry: boolean;
  statusCode?: number;
}

export const getErrorInfo = (
  error: FetchBaseQueryError | SerializedError | undefined
): ErrorInfo => {
  if (!error) {
    return {
      type: 'unknown',
      message: 'An unknown error occurred',
      canRetry: false,
    };
  }

  // Handle FetchBaseQueryError
  if ('status' in error) {
    const status = typeof error.status === 'number' ? error.status : 0;
    
    // Handle special string status codes
    if (error.status === 'FETCH_ERROR' || error.status === 'PARSING_ERROR') {
      return {
        type: 'network',
        message: 'Unable to connect. Please check your internet connection.',
        canRetry: true,
      };
    }

    switch (status) {
      case 404:
        return {
          type: 'not_found',
          message: 'City not found. Please try a different search.',
          canRetry: false,
          statusCode: 404,
        };

      case 401:
      case 403:
        return {
          type: 'unauthorized',
          message: 'API authentication failed. Please check your API key.',
          canRetry: false,
          statusCode: status,
        };

      case 429:
        return {
          type: 'rate_limit',
          message: 'Too many requests. Please wait a moment before trying again.',
          canRetry: true,
          statusCode: 429,
        };

      case 500:
      case 502:
      case 503:
      case 504:
        return {
          type: 'server_error',
          message: 'Weather service temporarily unavailable. Please try again.',
          canRetry: true,
          statusCode: status,
        };

      case 0:
        return {
          type: 'network',
          message: 'Unable to connect. Please check your internet connection.',
          canRetry: true,
        };

      default:
        return {
          type: 'unknown',
          message: `An error occurred (${status}). Please try again.`,
          canRetry: true,
          statusCode: status,
        };
    }
  }

  // Handle SerializedError
  if ('message' in error) {
    return {
      type: 'unknown',
      message: error.message || 'An error occurred. Please try again.',
      canRetry: true,
    };
  }

  return {
    type: 'unknown',
    message: 'An unexpected error occurred',
    canRetry: false,
  };
};

export const getErrorIcon = (type: ApiErrorType): string => {
  switch (type) {
    case 'network':
      return '📡';
    case 'rate_limit':
      return '⏱️';
    case 'not_found':
      return '🔍';
    case 'unauthorized':
      return '🔒';
    case 'server_error':
      return '🔧';
    default:
      return '⚠️';
  }
};
