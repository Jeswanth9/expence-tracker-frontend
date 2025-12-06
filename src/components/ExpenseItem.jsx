import React from 'react';

const ExpenseItem = ({ expense, onEdit, onDelete }) => {
    const { category, description, amount } = expense || {};

    // Try to create a human-friendly date string; fall back to raw text
    let niceDate = '';
    try {
        if (expense && expense.date) {
            const d = new Date(expense.date);
            if (!isNaN(d.getTime())) niceDate = d.toLocaleDateString();
            else niceDate = String(expense.date).split('T')[0] || '';
        }
    } catch (err) {
        niceDate = String(expense?.date || '');
    }

    return (
        <li className="expense-item">
            <div className="row">
                <div className="dot" />
                <div className="meta">
                    <div className="category">{category}</div>
                    <div className="description">{description}</div>
                </div>
                <div className="amount">${Number(amount || 0).toFixed(2)}</div>
            </div>

            <div className="row row-actions">
                <div className="date">{niceDate}</div>
                <div className="actions">
                    <button className="btn ghost" onClick={() => onEdit(expense)}>Edit</button>
                    <button className="btn danger" onClick={() => onDelete(expense.id)}>Remove</button>
                </div>
            </div>
        </li>
    );
};

export default ExpenseItem;
