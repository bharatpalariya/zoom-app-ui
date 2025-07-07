import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import zoomSdk from '@zoom/appssdk';
import './App.css';

function AuthScreen() {
  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Welcome Back!</h2>
        <form className="auth-form">
          <input type="email" placeholder="Email" required />
          <input type="password" placeholder="Password" required />
          <button type="submit">Sign In</button>
        </form>
      </div>
    </div>
  );
}

function HomeScreen() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleStartStream = async () => {
    setLoading(true);
    setSuccess(false);
    setError(null);
    try {
      const response = await fetch('/api/stream/start', { method: 'POST' });
      if (!response.ok) throw new Error('Failed to start stream');
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-container">
      <header className="home-header">
        <h1>Home</h1>
        <p>This is a beautiful, responsive home screen with Zoom context ✅</p>
      </header>
      <main className="home-main">
        <div className="home-card">
          <h2>Welcome!</h2>
          <p>Enjoy your stay.</p>
          <button className="stream-btn" onClick={handleStartStream} disabled={loading}>
            {loading ? 'Starting Stream...' : 'Start Live Stream'}
          </button>
          {success && <div className="stream-success">✅ Stream started!</div>}
          {error && <div className="stream-error">❌ {error}</div>}
        </div>
      </main>
    </div>
  );
}

function App() {
  const navigate = useNavigate();

  useEffect(() => {
    zoomSdk.config({
      capabilities: ['getMeetingContext'],
    })
      .then(() => {
        return zoomSdk.getMeetingContext();
      })
      .then((context) => {
        console.log('Zoom context loaded:', context);
        navigate('/home');
      })
      .catch((err) => {
        console.error('Zoom SDK init failed:', err);
      });
  }, []);

  return (
    <Routes>
      <Route path="/auth" element={<AuthScreen />} />
      <Route path="/home" element={<HomeScreen />} />
      <Route path="*" element={<Navigate to="/auth" replace />} />
    </Routes>
  );
}

export default App;
