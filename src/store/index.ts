// Redux store configuration
import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { weatherApi } from './weatherApi';
import authReducer from './authSlice';
import settingsReducer from './settingsSlice';
import favoritesReducer from './favoritesSlice';
import { firestoreMiddleware } from './firestoreMiddleware';

// Create logger middleware for development
const loggerMiddleware = (storeAPI: any) => (next: any) => (action: any) => {
  if (import.meta.env.DEV) {
    console.log('dispatching', action);
    const result = next(action);
    console.log('next state', storeAPI.getState());
    return result;
  }
  return next(action);
};

export const store = configureStore({
  reducer: {
    [weatherApi.reducerPath]: weatherApi.reducer,
    auth: authReducer,
    settings: settingsReducer,
    favorites: favoritesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(weatherApi.middleware)
      .concat(firestoreMiddleware)
      .concat(loggerMiddleware),
  devTools: import.meta.env.DEV, // Enable Redux DevTools in development
});

// Setup listeners for RTK Query (refetchOnFocus, refetchOnReconnect)
setupListeners(store.dispatch);

// Export types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
