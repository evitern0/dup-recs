import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth.js';

export function AuthPage() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login');
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({ email: '', username: '', password: '' });

  async function onSubmit(event) {
    event.preventDefault();
    setMessage('');
    try {
      if (mode === 'register') {
        await register(form);
      } else {
        await login({ email: form.email, password: form.password });
      }
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <div className="hero grid">
      <section className="surface stack">
        <h1>Join your group, share a record, and keep the feed moving.</h1>
        <p>
          Login or register to see group activity, recommend albums, and comment on the music your friends are sharing.
        </p>
        <div className="row">
          <button className="button" type="button" onClick={() => setMode('login')}>
            Log in
          </button>
          <button className="button-secondary" type="button" onClick={() => setMode('register')}>
            Register
          </button>
        </div>
      </section>

      <form className="card stack" onSubmit={onSubmit}>
        <h2 className="section-title">{mode === 'register' ? 'Create your account' : 'Welcome back'}</h2>
        <label className="stack">
          <span>Email</span>
          <input
            type="email"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            required
          />
        </label>
        {mode === 'register' ? (
          <label className="stack">
            <span>Username</span>
            <input
              value={form.username}
              onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))}
              required
            />
          </label>
        ) : null}
        <label className="stack">
          <span>Password</span>
          <input
            type="password"
            value={form.password}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            required
          />
        </label>
        <button className="button" type="submit">
          {mode === 'register' ? 'Register' : 'Log in'}
        </button>
        {message ? <p className="helper">{message}</p> : null}
      </form>
    </div>
  );
}
