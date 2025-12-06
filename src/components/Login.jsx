import { useState } from 'react';
import { apiFetch } from '../utils/api';

const Login = ({ setToken }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const apiBase = import.meta.env.VITE_API_BASE;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMessage('');
    setLoading(true);

    const { res, body } = await apiFetch(`${apiBase}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: username, password }),
    });

    if (!res.ok) {
      setStatusMessage(body?.msg || body?.message || 'Login failed');
      setLoading(false);
      return;
    }

    if (body?.access_token) {
      setToken(body.access_token);
      setUsername('');
      setPassword('');
    } else {
      setStatusMessage('Login could not be completed.');
    }

    setLoading(false);
  };

  return (
    <form className="auth card" onSubmit={handleSubmit}>
      <h2>Welcome back</h2>
      <div className="subtle">Sign in to continue</div>

      <input
        className="field"
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
      />
      <input
        className="field"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      {statusMessage && <div className="form-status" style={{ marginTop: 8 }}>{statusMessage}</div>}

      <div className="form-actions">
        <button className="btn primary" type="submit" disabled={loading}>{loading ? 'Signing in…' : 'Sign in'}</button>
      </div>
    </form>
  );
};

export default Login;
