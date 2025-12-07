import React from 'react';

const Header = ({ token, onLogout, onNavigate, currentPage }) => {
    return (
        <header className="ui-header">
            <div className="ui-container">
                <div className="brand">
                    <div className="logo">💸</div>
                    <div className="title">Spendwise — My Expenses</div>
                </div>

                <div className="header-actions">
                    {token ? (
                        <div className="nav-group">
                            <button 
                                className={`btn nav-btn ${currentPage === 'expenses' ? 'active' : ''}`}
                                onClick={() => onNavigate('expenses')}
                            >
                                📊 Expenses
                            </button>
                            <button 
                                className={`btn nav-btn ${currentPage === 'analysis' ? 'active' : ''}`}
                                onClick={() => onNavigate('analysis')}
                            >
                                🔍 Analysis
                            </button>
                            <button className="btn ghost" onClick={onLogout}>Sign out</button>
                        </div>
                    ) : (
                        <div className="small-note">Private & easy</div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
