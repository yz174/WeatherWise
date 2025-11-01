import { Component } from 'react';
import type { ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  theme?: 'light' | 'dark';
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isDark = this.props.theme === 'dark';

      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '20px',
          textAlign: 'center',
          backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
          color: isDark ? '#e5e5e5' : '#1a1a1a',
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>😕</div>
          <h1 style={{ 
            fontSize: '2rem', 
            marginBottom: '1rem', 
            color: '#ef4444',
            fontWeight: '600',
          }}>
            Oops! Something went wrong
          </h1>
          <p style={{ 
            fontSize: '1rem', 
            marginBottom: '2rem', 
            color: isDark ? '#9ca3af' : '#6b7280',
            maxWidth: '500px',
          }}>
            We're sorry for the inconvenience. Please try refreshing the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '12px 24px',
              fontSize: '1rem',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '500',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#2563eb';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#3b82f6';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Refresh Page
          </button>
          {this.state.error && (
            <details style={{ 
              marginTop: '2rem', 
              textAlign: 'left', 
              maxWidth: '600px',
              width: '100%',
            }}>
              <summary style={{ 
                cursor: 'pointer', 
                color: isDark ? '#9ca3af' : '#6b7280',
                padding: '8px',
                userSelect: 'none',
              }}>
                ▶ Error Details
              </summary>
              <pre style={{
                marginTop: '1rem',
                padding: '1rem',
                backgroundColor: isDark ? '#2a2a2a' : '#f3f4f6',
                color: isDark ? '#e5e5e5' : '#1a1a1a',
                borderRadius: '8px',
                overflow: 'auto',
                fontSize: '0.875rem',
                border: `1px solid ${isDark ? '#3a3a3a' : '#e5e7eb'}`,
              }}>
                {this.state.error.toString()}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
