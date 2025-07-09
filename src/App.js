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
  const [participants, setParticipants] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState(null);

  // Fetch participants on mount
  useEffect(() => {
    const fetchParticipants = async () => {
      setScanning(true);
      setError(null);
      try {
        await zoomSdk.config({
          capabilities: ['getMeetingContext', 'getUserContext', 'getMeetingParticipants'],
        });
        const res = await zoomSdk.getMeetingParticipants();
        const list = (res?.participants || []).map((p) => ({
          ...p,
          verified: Math.random() > 0.5 // Random for demo
        }));
        setParticipants(list);
      } catch (err) {
        setError('Could not fetch participants. Please make sure you are in a Zoom meeting and have the right permissions.');
      } finally {
        setScanning(false);
      }
    };
    fetchParticipants();
  }, []);

  const handleScan = async () => {
    setScanning(true);
    setError(null);
    setError("handleScan:1");
    //checking old
    try {
      // Step 1: Get meeting ID
      await zoomSdk.config({
      capabilities: ['getMeetingContext', 'getUserContext', 'getMeetingParticipants'],
    });
    setError("handleScan:2");

      const context = await zoomSdk.getMeetingContext();
      setError("handleScan:3");
      const meetingId = context.meetingId;
      setError("handleScan:4");
  
      // Step 2: POST to backend to start Zoom → RTMP stream
      let res, result;
      try {
        res = await fetch("https://13.126.103.39/start-stream", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: {"meetingId": "9217312"}
        });
        setError("handleScan:5");
        result = await res.json();
        console.log("🎥 Stream started:", result.message);
      } catch (err) {
        setError("handleScan:5" + (err.message || err));
        setScanning(false);
        return;
      }
  
      // Step 3: Proceed with rest of your scan logic
      const zoomRes = await zoomSdk.getMeetingParticipants();
      const list = (zoomRes?.participants || []).map((p) => ({
        ...p,
        verified: Math.random() > 0.5 // Placeholder logic
      }));
  
      setParticipants(list);
    } catch (err) {
      // console.error("🚨 Stream trigger failed:", err);
      // setError("Failed to start stream or fetch participants.");
    } finally {
      setScanning(false);
    }
  };
  

  return (
    <div className="home-container">
      <header className="home-header">
        <h1 style={{ fontSize: '2.2rem', fontWeight: 700, color: '#4F8A8B', letterSpacing: 1 }}>Deepfake Defend</h1>
        <p style={{ fontSize: '1.1rem', color: '#555', marginTop: 8 }}>Protect your meeting from deepfakes. See who is verified in real time.</p>
      </header>
      <main className="home-main">
        <div className="home-card" style={{ maxWidth: 500, width: '100%', boxShadow: '0 6px 32px rgba(34,197,94,0.10)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
            <svg width="48" height="48" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g className="shield-pulse">
                <path d="M40 10 L70 25 V45 C70 60 55 70 40 75 C25 70 10 60 10 45 V25 Z" fill="#4F8A8B" stroke="#2C3333" strokeWidth="3"/>
                <path d="M40 20 L60 30 V45 C60 55 50 62 40 65 C30 62 20 55 20 45 V30 Z" fill="#F9F9F9" stroke="#2C3333" strokeWidth="2"/>
              </g>
            </svg>
            <span style={{ fontWeight: 600, fontSize: '1.3rem', marginLeft: 16, color: '#222' }}>Participant Verification</span>
          </div>
          <button className="scan-btn" onClick={handleScan} disabled={scanning} style={{marginBottom: '1.5rem'}}>
            {scanning ? 'Scanning...' : 'Rescan Participants'}
          </button>
          {error && <div className="stream-error" style={{marginBottom: 16}}>{error}</div>}
          <div className="participants-list" style={{marginTop: 0, textAlign: 'left'}}>
            <h3 style={{marginBottom: 12, color: '#4F8A8B'}}>Participants</h3>
            {participants.length === 0 && !scanning && !error && (
              <div style={{color: '#888', fontStyle: 'italic'}}>No participants found.</div>
            )}
            <ul style={{listStyle: 'none', padding: 0}}>
              {participants.map((p) => (
                <li key={p.participantUUID} style={{display: 'flex', alignItems: 'center', marginBottom: '0.5rem', background: '#f0fdfa', borderRadius: 8, padding: '0.5rem 1rem'}}>
                  <span style={{flex: 1, fontWeight: 500}}>{p.screenName || p.participantUUID}</span>
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
        </div>
      </main>
    </div>
  );
}

function App() {
  const navigate = useNavigate();

  useEffect(() => {
    zoomSdk.config({
      capabilities: ['getMeetingContext', 'getUserContext','getMeetingParticipants'],
    })
      .then(() => {
        return Promise.all([
          zoomSdk.getMeetingContext(),
          zoomSdk.getUserContext(),
          zoomSdk.getMeetingParticipants()
        ]);
      })
      .then(([meetingContext, userContext, participants]) => {
        console.log('Zoom meeting context:', meetingContext);
        console.log('Zoom user context:', userContext);
        // You can now use userContext.userId, userContext.email, etc.
        console.log('Participants on load:', participants);
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
