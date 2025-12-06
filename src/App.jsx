import { useState, useEffect } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import Header from './components/Header';
import Expenses from './components/Expenses';
import './App.css';

function App() {
  const [token, setToken] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const handleSetToken = (token) => {
    setToken(token);
    localStorage.setItem('token', token);
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('token');
  };

  return (
    <div className="App">
      <Header token={token} onLogout={handleLogout} />

      {!token ? (
        <main className="ui-container auth-grid">
          <div className="auth-left">
            <h1>Track smarter. Spend better.</h1>
            <p className="subtle">Beautiful, fast and private expense tracking to help you stay on top of your money.</p>
          </div>

          <div className="auth-right">
            <Register />
            <Login setToken={handleSetToken} />
          </div>
        </main>
      ) : (
        <Expenses token={token} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;
