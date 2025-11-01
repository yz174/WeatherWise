import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setTemperatureUnit } from '../store/settingsSlice';
import './SettingsPanel.css';

// Import icons from public folder
const temperatureIcon = '/temperature-high.png';
const settingsIcon = '/settings.png';

const SettingsPanel = () => {
  const dispatch = useAppDispatch();
  const temperatureUnit = useAppSelector((state) => state.settings.temperatureUnit);

  const handleUnitChange = useCallback((unit: 'celsius' | 'fahrenheit') => {
    dispatch(setTemperatureUnit(unit));
  }, [dispatch]);

  return (
    <div className="settings-panel">
      <div className="settings-header">
        <img src={settingsIcon} alt="Settings" className="settings-icon-img" />
        <h3 className="settings-title">Settings</h3>
      </div>
      
      <div className="settings-group">
        <label className="settings-label">
          <img src={temperatureIcon} alt="Temperature" className="label-icon-img" />
          <span>Temperature Unit</span>
        </label>
        <div className="temperature-toggle">
          <button
            className={`toggle-button ${temperatureUnit === 'celsius' ? 'active' : ''}`}
            onClick={() => handleUnitChange('celsius')}
          >
            °C
          </button>
          <button
            className={`toggle-button ${temperatureUnit === 'fahrenheit' ? 'active' : ''}`}
            onClick={() => handleUnitChange('fahrenheit')}
          >
            °F
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
