import { useState, useCallback } from 'react';

interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
}

interface RetryState {
  retryCount: number;
  isRetrying: boolean;
  nextRetryDelay: number;
}

export const useRetry = (options: RetryOptions = {}) => {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffMultiplier = 2,
  } = options;

  const [retryState, setRetryState] = useState<RetryState>({
    retryCount: 0,
    isRetrying: false,
    nextRetryDelay: initialDelay,
  });

  const calculateDelay = useCallback(
    (attemptNumber: number): number => {
      const delay = initialDelay * Math.pow(backoffMultiplier, attemptNumber);
      return Math.min(delay, maxDelay);
    },
    [initialDelay, backoffMultiplier, maxDelay]
  );

  const retry = useCallback(
    async (fn: () => Promise<void> | void): Promise<boolean> => {
      if (retryState.retryCount >= maxRetries) {
        return false;
      }

      setRetryState((prev) => ({
        ...prev,
        isRetrying: true,
      }));

      const delay = calculateDelay(retryState.retryCount);

      await new Promise((resolve) => setTimeout(resolve, delay));

      try {
        await fn();
        setRetryState({
          retryCount: 0,
          isRetrying: false,
          nextRetryDelay: initialDelay,
        });
        return true;
      } catch (error) {
        const newRetryCount = retryState.retryCount + 1;
        setRetryState({
          retryCount: newRetryCount,
          isRetrying: false,
          nextRetryDelay: calculateDelay(newRetryCount),
        });
        return false;
      }
    },
    [retryState.retryCount, maxRetries, calculateDelay, initialDelay]
  );

  const reset = useCallback(() => {
    setRetryState({
      retryCount: 0,
      isRetrying: false,
      nextRetryDelay: initialDelay,
    });
  }, [initialDelay]);

  const canRetry = retryState.retryCount < maxRetries;

  return {
    retry,
    reset,
    canRetry,
    retryCount: retryState.retryCount,
    isRetrying: retryState.isRetrying,
    nextRetryDelay: retryState.nextRetryDelay,
    maxRetries,
  };
};
