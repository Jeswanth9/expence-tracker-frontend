import React from 'react';

const Header = ({ token, onLogout }) => {
    return (
        <header className="ui-header">
            <div className="ui-container">
                <div className="brand">
                    <div className="logo">💸</div>
                    <div className="title">Spendwise — My Expenses</div>
                </div>

                <div className="header-actions">
                    {token ? (
                        <button className="btn ghost" onClick={onLogout}>Sign out</button>
                    ) : (
                        <div className="small-note">Private & easy</div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
