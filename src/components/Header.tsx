import { useAppSelector, useAppDispatch } from '../store/hooks';
import { signOut } from '../services/authService';
import { clearUser, setLoading } from '../store/authSlice';
import './Header.css';

const Header = () => {
  const { user, isAuthenticated, isLoading } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  const handleSignOut = async () => {
    dispatch(setLoading(true));
    const result = await signOut();
    
    if (result.success) {
      dispatch(clearUser());
    } else {
      dispatch(setLoading(false));
      console.error('Sign out failed:', result.error);
    }
  };

  return (
    <header className="header">
      <div className="header-brand">
        <h1 className="header-title">WeatherWise</h1>
      </div>

      <div className="header-actions">
        {isAuthenticated && user ? (
          <>
            <div className="user-profile">
              {user.photoURL && (
                <img
                  src={user.photoURL}
                  alt={user.displayName}
                  className="user-avatar"
                />
              )}
              <span className="user-name">
                {user.displayName || user.email}
              </span>
            </div>
            <button
              onClick={handleSignOut}
              disabled={isLoading}
              className="auth-button sign-out-button"
            >
              {isLoading ? 'Signing out...' : 'Sign Out'}
            </button>
          </>
        ) : null}
      </div>
    </header>
  );
};

export default Header;
