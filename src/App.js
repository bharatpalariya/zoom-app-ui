import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import zoomSdk from '@zoom/appssdk';
import './App.css';

function AuthScreen() {
  const navigate = useNavigate();
  const handleStart = (e) => {
    e.preventDefault();
    navigate('/home');
  };
  return (
    <div className="auth-container">
      <div className="auth-box animated-box">
        <h1 className="animated-title">Deepfake Defend</h1>
        <div className="animated-logo">
          {/* Example animation: a shield with a pulse effect */}
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g className="shield-pulse">
              <path d="M40 10 L70 25 V45 C70 60 55 70 40 75 C25 70 10 60 10 45 V25 Z" fill="#4F8A8B" stroke="#2C3333" strokeWidth="3"/>
              <path d="M40 20 L60 30 V45 C60 55 50 62 40 65 C30 62 20 55 20 45 V30 Z" fill="#F9F9F9" stroke="#2C3333" strokeWidth="2"/>
            </g>
          </svg>
        </div>
        <button className="start-btn" onClick={handleStart}>Start</button>
      </div>
    </div>
  );
}

function HomeScreen() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [scanning, setScanning] = useState(false);

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

  const handleScan = async () => {
    setScanning(true);
    setError(null);
    try {
      // Get participants from Zoom SDK
      const res = await zoomSdk.getMeetingParticipants();
      // For demo, randomly assign verified status
      const list = (res?.participants || []).map((p) => ({
        ...p,
        verified: Math.random() > 0.5 // Random for demo
      }));
      setParticipants(list);
    } catch (err) {
      setError('Failed to fetch participants');
    } finally {
      setScanning(false);
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
          <button className="scan-btn" onClick={handleScan} disabled={scanning} style={{marginTop: '1rem'}}>
            {scanning ? 'Scanning...' : 'Scan'}
          </button>
          {success && <div className="stream-success">✅ Stream started!</div>}
          {error && <div className="stream-error">❌ {error}</div>}
          {participants.length > 0 && (
            <div className="participants-list" style={{marginTop: '2rem', textAlign: 'left'}}>
              <h3>Participants</h3>
              <ul style={{listStyle: 'none', padding: 0}}>
                {participants.map((p) => (
                  <li key={p.participantUUID} style={{display: 'flex', alignItems: 'center', marginBottom: '0.5rem'}}>
                    <span style={{flex: 1}}>{p.screenName || p.participantUUID}</span>
                    <span style={{
                      color: p.verified ? '#22c55e' : '#ef4444',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      {p.verified ? 'Verified' : 'Not Verified'}
                      <span style={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        background: p.verified ? '#22c55e' : '#ef4444',
                        display: 'inline-block',
                        marginLeft: 8
                      }}></span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function App() {
  const navigate = useNavigate();

  useEffect(() => {
    zoomSdk.config({
      capabilities: ['getMeetingContext', 'getUserContext'],
    })
      .then(() => {
        return Promise.all([
          zoomSdk.getMeetingContext(),
          zoomSdk.getUserContext()
        ]);
      })
      .then(([meetingContext, userContext]) => {
        console.log('Zoom meeting context:', meetingContext);
        console.log('Zoom user context:', userContext);
        // You can now use userContext.userId, userContext.email, etc.
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
