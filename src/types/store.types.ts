// Redux store type definitions

export interface AuthState {
  user: {
    uid: string;
    email: string;
    displayName: string;
    photoURL: string;
  } | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface SettingsState {
  temperatureUnit: 'celsius' | 'fahrenheit';
}

export interface FavoritesState {
  cityIds: string[];
  pinnedCityIds: string[];
  syncStatus: 'idle' | 'syncing' | 'synced' | 'error';
}

export interface RootState {
  auth: AuthState;
  settings: SettingsState;
  favorites: FavoritesState;
  // weatherApi reducer will be added by RTK Query
  [key: string]: any;
}
