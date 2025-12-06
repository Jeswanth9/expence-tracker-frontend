import React from 'react';

const Summary = ({ total, count }) => {
    const safeTotal = Number(total || 0);
    const safeCount = Number(count || 0);
    const average = safeCount ? safeTotal / safeCount : 0;

    return (
        <div className="summary-grid">
            <div className="card primary">
                <div className="card-title">Total this period</div>
                <div className="card-value">${safeTotal.toFixed(2)}</div>
            </div>

            <div className="card">
                <div className="card-title">Items</div>
                <div className="card-value">{safeCount}</div>
            </div>

            <div className="card">
                <div className="card-title">Average</div>
                <div className="card-value">${average.toFixed(2)}</div>
            </div>
        </div>
    );
};

export default Summary;
