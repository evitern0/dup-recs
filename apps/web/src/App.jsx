import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './hooks/useAuth.jsx';
import { AuthPage } from './pages/AuthPage.jsx';
import { GroupTimelinePage } from './pages/GroupTimelinePage.jsx';
import { MemberProfilePage } from './pages/MemberProfilePage.jsx';

export default function App() {
  const { session, logout, setActiveGroupId } = useAuth();

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <strong>dup-recs</strong>
          <span>Private group music recommendations</span>
        </div>
        {session.user ? (
          <div className="row">
            <span className="small-copy">{session.user.username}</span>
            <button className="button-secondary" type="button" onClick={logout}>
              Log out
            </button>
          </div>
        ) : null}
      </header>

      <Routes>
        <Route path="/" element={session.user ? <Navigate to="/app" replace /> : <AuthPage />} />
        <Route
          path="/app"
          element={session.user ? <GroupTimelinePage onSelectGroup={setActiveGroupId} /> : <Navigate to="/" replace />}
        />
        <Route
          path="/users/:username"
          element={session.user ? <MemberProfilePage /> : <Navigate to="/" replace />}
        />
      </Routes>
    </div>
  );
}
