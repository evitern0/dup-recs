import React from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth.jsx';
import { AuthPage } from './pages/AuthPage.jsx';
import { GroupManagementPage } from './pages/GroupManagementPage.jsx';
import { GroupTimelinePage } from './pages/GroupTimelinePage.jsx';
import { MemberProfilePage } from './pages/MemberProfilePage.jsx';

export default function App() {
  const navigate = useNavigate();
  const { session, logout, setActiveGroupId } = useAuth();
  const groups = session.groups ?? [];
  const hasSingleGroup = groups.length === 1;

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-lockup">
          <div className="brand">
            <strong>dup-recs</strong>
            <span>Private group music recommendations</span>
          </div>
          <img className="brand-mark" src="/header-mark.svg" alt="dup-recs mark" />
        </div>
        {session.user ? (
          <div className="row">
            <button className="button-secondary" type="button" onClick={() => navigate('/groups')}>
              Groups
            </button>
            <button className="button-secondary" type="button" onClick={() => navigate(`/users/${session.user.username}`)}>
              {session.user.username}
            </button>
            <button className="button-secondary" type="button" onClick={logout}>
              Log out
            </button>
          </div>
        ) : null}
      </header>

      <Routes>
        <Route path="/" element={session.user ? <Navigate to={hasSingleGroup ? '/app' : '/groups'} replace /> : <AuthPage />} />
        <Route path="/groups" element={session.user ? <GroupManagementPage onSelectGroup={setActiveGroupId} /> : <Navigate to="/" replace />} />
        <Route
          path="/app"
          element={session.user && session.activeGroupId ? <GroupTimelinePage onSelectGroup={setActiveGroupId} /> : <Navigate to="/groups" replace />}
        />
        <Route
          path="/users/:username"
          element={session.user ? <MemberProfilePage /> : <Navigate to="/" replace />}
        />
      </Routes>
    </div>
  );
}
