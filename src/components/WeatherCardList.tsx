import { useAppSelector } from '../store/hooks';
import WeatherCard from './WeatherCard';
import './WeatherCardList.css';

const WeatherCardList = () => {
  const favorites = useAppSelector((state) => state.favorites.cityIds);

  if (favorites.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">🌍</div>
        <h3>No favorite cities yet</h3>
        <p>Search for a city above to add it to your favorites and see the weather!</p>
      </div>
    );
  }

  return (
    <div className="weather-card-list">
      {favorites.map((cityId) => (
        <WeatherCard key={cityId} cityId={cityId} />
      ))}
    </div>
  );
};

export default WeatherCardList;
