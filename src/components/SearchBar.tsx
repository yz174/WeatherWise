import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSearchCitiesQuery } from '../store/weatherApi';
// import { useAppDispatch } from '../store/hooks';
// import { addFavorite } from '../store/favoritesSlice';
import { getErrorInfo } from '../utils/errorHandling';
import type { City } from '../types/city.types';
import './SearchBar.css';

const SearchBar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const searchRef = useRef<HTMLDivElement>(null);
  // const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // Debounce search input (300ms delay)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Use RTK Query hook for autocomplete
  const { data: cities = [], isLoading, error } = useSearchCitiesQuery(debouncedQuery, {
    skip: debouncedQuery.length < 2,
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setIsOpen(true);
  }, []);

  const handleCitySelect = useCallback((city: City) => {
    const cityId = `${city.name},${city.country}`;
    // Navigate to detailed view (don't add to favorites automatically)
    navigate(`/city/${encodeURIComponent(cityId)}`);
    setSearchQuery('');
    setIsOpen(false);
  }, [navigate]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!cities || cities.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev < cities.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (cities[selectedIndex]) {
          handleCitySelect(cities[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  }, [cities, selectedIndex, handleCitySelect]);

  // Reset selected index when cities change
  useEffect(() => {
    setSelectedIndex(0);
  }, [cities]);

  const showDropdown = isOpen && searchQuery.length >= 2;

  // Get error information if there's an error
  const errorInfo = error ? getErrorInfo(error) : null;

  return (
    <div className="search-bar" ref={searchRef}>
      <div className="search-input-wrapper">
        <input
          type="text"
          className="search-input"
          placeholder="Search for a city..."
          value={searchQuery}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
        />
        {isLoading && <div className="search-loading">🔍</div>}
      </div>

      {showDropdown && (
        <div className="search-dropdown">
          {isLoading ? (
            <div className="search-dropdown-item loading">
              <span className="loading-dots">Searching</span>
            </div>
          ) : error ? (
            <div className="search-dropdown-item error">
              <div className="search-error-icon">
                {errorInfo?.type === 'rate_limit' ? '⏱️' : '⚠️'}
              </div>
              <div className="search-error-message">
                {errorInfo?.type === 'rate_limit'
                  ? 'Rate limit reached. Please wait a moment.'
                  : errorInfo?.type === 'network'
                  ? 'Connection error. Check your internet.'
                  : 'Search failed. Please try again.'}
              </div>
            </div>
          ) : cities.length > 0 ? (
            cities.map((city, index) => (
              <div
                key={city.id}
                className={`search-dropdown-item ${index === selectedIndex ? 'selected' : ''}`}
                onClick={() => handleCitySelect(city)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div className="city-name">{city.name}</div>
                <div className="city-details">
                  {city.region && `${city.region}, `}
                  {city.country}
                </div>
              </div>
            ))
          ) : (
            <div className="search-dropdown-item no-results">
              <div className="no-results-icon">🔍</div>
              <div className="no-results-text">
                No cities found for "{searchQuery}"
              </div>
              <div className="no-results-hint">
                Try a different spelling or city name
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
