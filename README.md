# Weather Analytics Dashboard

A comprehensive weather dashboard application built with React, TypeScript, and Redux Toolkit. Features real-time weather data, interactive charts, and multi-city tracking with Google authentication.

## Features

-  Real-time weather data for multiple cities
-  Interactive charts for temperature, precipitation, and wind patterns
-  Google OAuth authentication with Firebase
-  Favorite cities with cloud sync
-  Celsius/Fahrenheit unit switching
-  Fully responsive design
-  Optimized caching and performance

## Tech Stack

- **Frontend**: React 19 + TypeScript
- **State Management**: Redux Toolkit with RTK Query
- **Routing**: React Router v7
- **Charts**: Recharts
- **Authentication**: Firebase Auth
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **API**: WeatherAPI.com

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```


## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Weather API key from [WeatherAPI.com](https://www.weatherapi.com/)
- Firebase project with Google OAuth configured

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd weather-dashboard
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```

4. Edit `.env.local` and add your API keys:
   ```env
   VITE_WEATHER_API_KEY=your-weather-api-key
   VITE_FIREBASE_API_KEY=your-firebase-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:5173](http://localhost:5173) in your browser

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:prod` - Build with production optimizations
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run type-check` - Run TypeScript type checking


## Project Structure

```
weather-dashboard/
├── src/
│   ├── components/       # React components
│   ├── pages/           # Page components
│   ├── store/           # Redux store and slices
│   ├── services/        # API services
│   ├── utils/           # Utility functions
│   ├── types/           # TypeScript types
│   ├── App.tsx          # Root component
│   └── main.tsx         # Entry point
├── public/              # Static assets
├── dist/                # Build output
├── .env.example         # Environment variables template
├── vite.config.ts       # Vite configuration
├── vercel.json          # Vercel deployment config
├── netlify.toml         # Netlify deployment config
└── DEPLOYMENT.md        # Deployment guide
```

## Environment Variables

All environment variables must be prefixed with `VITE_` to be accessible in the application.

Required variables:
- `VITE_WEATHER_API_KEY` - Your WeatherAPI.com API key
- `VITE_FIREBASE_API_KEY` - Firebase API key
- `VITE_FIREBASE_AUTH_DOMAIN` - Firebase auth domain
- `VITE_FIREBASE_PROJECT_ID` - Firebase project ID
- `VITE_FIREBASE_STORAGE_BUCKET` - Firebase storage bucket
- `VITE_FIREBASE_MESSAGING_SENDER_ID` - Firebase messaging sender ID
- `VITE_FIREBASE_APP_ID` - Firebase app ID

## Features in Detail

### Weather Data
- Current weather conditions
- 7-day forecast
- Hourly forecast (24 hours)
- Detailed statistics (pressure, humidity, UV index, etc.)

### Charts & Visualizations
- Temperature trends (hourly and daily)
- Precipitation patterns
- Wind speed and direction
- Interactive tooltips and legends

### User Features
- Search cities with autocomplete
- Save favorite cities
- Toggle temperature units (°C/°F)
- Google sign-in for cloud sync
- Responsive design for all devices

### Performance
- Intelligent caching (60s for current weather, 5min for forecasts)
- Code splitting and lazy loading
- Optimized bundle size
- Asset caching headers

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
