import { useState, useEffect } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import Header from './components/Header';
import Expenses from './components/Expenses';
import StaticAnalysisDashboard from './components/StaticAnalysisDashboard';
import './App.css';

function App() {
  const [token, setToken] = useState(null);
  const [currentPage, setCurrentPage] = useState('expenses');

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
    setCurrentPage('expenses');
  };

  const handleNavigateTo = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="App">
      <Header 
        token={token} 
        onLogout={handleLogout}
        onNavigate={handleNavigateTo}
        currentPage={currentPage}
      />

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
        <>
          {currentPage === 'expenses' && (
            <Expenses token={token} onLogout={handleLogout} />
          )}
          {currentPage === 'analysis' && (
            <StaticAnalysisDashboard />
          )}
        </>
      )}
    </div>
  );
}

export default App;
