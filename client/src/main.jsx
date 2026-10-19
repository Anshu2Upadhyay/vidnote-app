import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: 'sans-serif', background: '#F8FAFC', color: '#1E293B', textAlign: 'center' }}>
          <div style={{ fontSize: '42px', marginBottom: '12px' }}>✨</div>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>VidNote Loading Notice</h2>
          <p style={{ fontSize: '12px', color: '#64748B', maxWidth: '300px', marginBottom: '20px', lineHeight: '1.5' }}>
            {this.state.error?.message || 'A cache sync occurred. Tap below to reload fresh assets.'}
          </p>
          <button
            onClick={() => {
              if (typeof window !== 'undefined' && 'caches' in window) {
                caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k)))).then(() => {
                  window.location.reload();
                });
              } else {
                window.location.reload();
              }
            }}
            style={{ background: '#2563EB', color: '#fff', border: 'none', padding: '10px 22px', borderRadius: '12px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 12px rgba(37,99,235,0.2)' }}
          >
            Clear Cache & Refresh
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);