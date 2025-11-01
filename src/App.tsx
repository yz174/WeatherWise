import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useAppDispatch } from './store/hooks';
import { setUser, clearUser, setLoading } from './store/authSlice';
import { setupAuthListener } from './services/authService';
import {
  syncUserDataFromFirestore,
  clearUserDataOnSignOut,
} from './services/syncService';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import './App.css';

// Lazy load DetailedView for better initial load performance
const DetailedView = lazy(() => import('./pages/DetailedView'));

function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Initialize auth state listener
    dispatch(setLoading(true));
    
    const unsubscribe = setupAuthListener((user) => {
      if (user) {
        console.log('=== USER SIGNED IN - STARTING SYNC ===');
        // User signed in - set user and sync data from Firestore
        dispatch(setUser(user));
        // Sync user data from Firestore (prefer cloud data)
        syncUserDataFromFirestore(user.uid, dispatch).then(() => {
          console.log('=== SYNC COMPLETED ===');
          dispatch(setLoading(false));
        }).catch((error) => {
          console.error('=== SYNC FAILED ===', error);
          dispatch(setLoading(false));
        });
      } else {
        console.log('=== USER SIGNED OUT - CLEARING DATA ===');
        // User signed out - clear user and local data
        dispatch(clearUser());
        clearUserDataOnSignOut(dispatch);
        dispatch(setLoading(false));
      }
    });

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, [dispatch]);

  // Setup focus refetch for RTK Query
  useEffect(() => {
    const handleFocus = () => {
      // RTK Query will automatically refetch stale queries when window regains focus
      // This is handled by setupListeners in the store configuration
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <div className="app-container">
          <Suspense fallback={
            <div className="loading-container">
              <div className="loading-content">
                <div className="loading-icon">⏳</div>
                <p className="loading-text">Loading...</p>
              </div>
            </div>
          }>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/city/:cityId"
                element={
                  <ProtectedRoute>
                    <DetailedView />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Suspense>
        </div>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
