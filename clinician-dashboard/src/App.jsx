import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import ToastBanner from './components/ToastBanner';
import OverviewView from './views/OverviewView';
import KinematicsPlayerView from './views/KinematicsPlayerView';
import PatientProfileView from './views/PatientProfileView';
import ProtocolBuilderView from './views/ProtocolBuilderView';
import { api } from './api';

function LoginScreen({ onLoggedIn }) {
  const [email, setEmail] = useState('clinician@demo.com');
  const [password, setPassword] = useState('DemoPass123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.login(email, password);
      if ((res.user?.role || '').toLowerCase() !== 'clinician') {
        throw new Error('This account is registered as a patient. Please sign in with a clinician account.');
      }
      onLoggedIn(res.token, res.user);
    } catch (err) {
      setError(err.message || 'Login failed. Please verify email and password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-surface">
      <div className="w-full max-w-md bg-surface-container-lowest p-6 sm:p-8 rounded-2xl shadow-lg border border-surface-container flex flex-col items-center">
        {/* Kinetic Clinical Logo */}
        <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-md mb-4 p-2">
          <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
            <path
              d="M12 34C14 26 19 16 26 14C31 12.5 35 15 36 20C37 25 33 29 27 30C21 31 16 27 15 22"
              stroke="#ffffff"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <circle cx="26" cy="14" r="3.5" fill="#38bdf8" />
            <circle cx="36" cy="20" r="2.5" fill="#ffffff" />
            <circle cx="15" cy="22" r="2.5" fill="#bae6fd" />
          </svg>
        </div>

        <h1 className="text-xl sm:text-2xl font-bold text-on-surface text-center">
          Kinetic Clinical
        </h1>
        <p className="text-xs text-on-surface-variant text-center mt-1 mb-6">
          Clinician-Calibrated Rehabilitation Quality and Progression System
        </p>

        {error && (
          <div className="w-full mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">error</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div>
            <label className="text-xs text-on-surface-variant block mb-1 font-semibold">
              Clinician Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-surface-container-low border border-surface-container rounded-xl px-3.5 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary"
              required
            />
          </div>

          <div>
            <label className="text-xs text-on-surface-variant block mb-1 font-semibold">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-surface-container-low border border-surface-container rounded-xl px-3.5 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-primary text-white text-sm font-bold shadow-md hover:bg-primary-container active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[20px]">login</span>
            <span>{loading ? 'Authenticating...' : 'Sign In as Clinician'}</span>
          </button>
        </form>

        <div className="w-full mt-6 pt-4 border-t border-surface-container text-center">
          <p className="text-[11px] text-on-surface-variant">
            Demo Credentials: <span className="font-mono text-primary font-medium">clinician@demo.com</span> / <span className="font-mono text-primary font-medium">DemoPass123</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem('clinician_token') || '');
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('clinician_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [selectedSessionId, setSelectedSessionId] = useState(null);

  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

  const showToast = (message, type = 'info') => {
    setToast({ show: true, message, type });
  };

  const handleLoggedIn = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('clinician_token', newToken);
    localStorage.setItem('clinician_user', JSON.stringify(newUser));
    showToast(`Welcome back, ${newUser.name}`, 'verified');
  };

  const handleLogout = () => {
    setToken('');
    setUser(null);
    localStorage.removeItem('clinician_token');
    localStorage.removeItem('clinician_user');
    setActiveTab('overview');
    setSelectedPatientId(null);
    setSelectedSessionId(null);
  };

  const handleNavigate = (tab, payload) => {
    if (tab === 'patient-profile' && payload?.patientId) {
      setSelectedPatientId(payload.patientId);
      setActiveTab('patients');
    } else if (tab === 'kinematics' && payload?.sessionId) {
      setSelectedSessionId(payload.sessionId);
      setActiveTab('kinematics');
    } else if (tab === 'protocol-builder' && payload?.patientId) {
      setSelectedPatientId(payload.patientId);
      setActiveTab('protocols');
    } else {
      setActiveTab(tab);
    }
  };

  if (!token || !user) {
    return <LoginScreen onLoggedIn={handleLoggedIn} />;
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col font-sans text-on-surface">
      <Header
        user={user}
        activeTab={activeTab}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-24">
        {activeTab === 'overview' && (
          <OverviewView
            token={token}
            user={user}
            onNavigate={handleNavigate}
            showToast={showToast}
          />
        )}

        {activeTab === 'patients' && (
          <PatientProfileView
            token={token}
            patientId={selectedPatientId}
            onSelectPatient={setSelectedPatientId}
            onNavigate={handleNavigate}
            showToast={showToast}
          />
        )}

        {activeTab === 'kinematics' && (
          <KinematicsPlayerView
            token={token}
            sessionId={selectedSessionId}
            onNavigate={handleNavigate}
            showToast={showToast}
          />
        )}

        {activeTab === 'protocols' && (
          <ProtocolBuilderView
            token={token}
            patientId={selectedPatientId}
            onNavigate={handleNavigate}
            showToast={showToast}
          />
        )}
      </main>

      <BottomNav
        activeTab={activeTab}
        onTabChange={(tab) => {
          if (tab === 'patients' && !selectedPatientId) {
            // Default to overview if no patient is selected
            setActiveTab('patients');
          } else {
            setActiveTab(tab);
          }
        }}
      />

      <ToastBanner
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ show: false, message: '', type: 'info' })}
      />
    </div>
  );
}
