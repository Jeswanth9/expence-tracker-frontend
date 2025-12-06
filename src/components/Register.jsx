import { useState } from 'react';
import { apiFetch } from '../utils/api';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [statusMessage, setStatusMessage] = useState('');
  const apiBase = import.meta.env.VITE_API_BASE;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setStatusMessage('');

    // basic client check
    if (!password || password.length < 8) {
      setErrors({ password: 'Password must be at least 8 characters.' });
      return;
    }

    const { res, body } = await apiFetch(`${apiBase}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: username, password }),
    });

    if (!res.ok) {
      // handle validation errors returned by the API
      const json = body;
      if (json && json.validation_error && Array.isArray(json.validation_error.body_params)) {
        const fieldErrors = {};
        for (const entry of json.validation_error.body_params) {
          const loc = entry.loc && Array.isArray(entry.loc) ? entry.loc[0] : null;
          if (loc) fieldErrors[loc] = entry.msg;
        }
        setErrors(fieldErrors);
        return;
      }

      setStatusMessage(json?.message || 'Registration failed — please check your input.');
      return;
    }

    // success
    setStatusMessage('Account created — you can sign in now.');
    setUsername('');
    setPassword('');
  };

  return (
    <form className="auth card" onSubmit={handleSubmit}>
      <h2>Create account</h2>
      <div className="subtle">Start tracking your spending in moments</div>

      <input
        className="field"
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
      />
      {errors.name && <div className="field-note">{errors.name}</div>}

      <input
        className="field"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      {errors.password && <div className="field-note">{errors.password}</div>}

      {statusMessage && <div className="form-status subtle" style={{ marginTop: 6 }}>{statusMessage}</div>}

      <div className="form-actions">
        <button className="btn primary" type="submit">Create account</button>
      </div>
    </form>
  );
};

export default Register;
