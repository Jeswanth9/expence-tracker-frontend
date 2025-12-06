import { useState, useEffect } from 'react';
import { apiFetch } from '../utils/api';

const ExpenseForm = ({ token, expense, onSave, onLogout }) => {
  // form state (use explicit, slightly different names to feel handcrafted)
  const [amountValue, setAmountValue] = useState('');
  const [categoryValue, setCategoryValue] = useState('');
  const [note, setNote] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [errorMessage, setErrorMessage] = useState('');
  const apiBase = import.meta.env.VITE_API_BASE;

  // When `expense` changes, populate the form for editing; otherwise clear it
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    if (expense) {
      setAmountValue(String(expense.amount ?? ''));
      setCategoryValue(expense.category ?? '');
      setNote(expense.description ?? '');

      // Try to normalize a few different date shapes into yyyy-mm-dd
      let normalized = '';
      if (expense.date) {
        const parsed = new Date(expense.date);
        if (!isNaN(parsed.getTime())) normalized = parsed.toISOString().split('T')[0];
        else if (typeof expense.date === 'string' && expense.date.includes('-')) normalized = expense.date.split('T')[0];
      }

      setSelectedDate(normalized || today);
    } else {
      setAmountValue('');
      setCategoryValue('');
      setNote('');
      setSelectedDate(today);
    }
  }, [expense]);

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setErrorMessage('');

    const endpoint = expense ? `${apiBase}/expenses/${expense.id}` : `${apiBase}/expenses`;
    const method = expense ? 'PUT' : 'POST';

    const dateIso = selectedDate || new Date().toISOString().split('T')[0];

    // Prevent selecting a future date — compare in UTC to avoid timezone differences
    const [yy, mm, dd] = dateIso.split('-').map(Number);
    const selectedUtc = Date.UTC(yy, (mm || 1) - 1, dd || 1);
    const todayUtc = Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate());
    if (selectedUtc > todayUtc) {
      setErrorMessage('Please choose today or a past date.');
      return;
    }

    // Convert to an ISO timestamp at UTC midnight so the API receives a consistent value
    const dateToSend = new Date(Date.UTC(yy, mm - 1, dd)).toISOString();

    const { res, body } = await apiFetch(endpoint, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        amount: amountValue,
        category: categoryValue,
        description: note,
        date: dateToSend,
      }),
    }, onLogout);

    if (!res.ok) {
      setErrorMessage((body && (body.msg || body.message)) || 'Could not save expense.');
      return;
    }

    // inform parent to refresh the list and clear editing state
    onSave();

    // if we just created a new expense, clear inputs for next entry
    if (!expense) {
      setAmountValue('');
      setCategoryValue('');
      setNote('');
      setSelectedDate(new Date().toISOString().split('T')[0]);
    }
  };

  const todayMax = new Date().toISOString().split('T')[0];

  return (
    <form className="form card" onSubmit={handleSubmit}>
      <div className="form-head">
        <h3>{expense ? 'Edit entry' : 'Record an expense'}</h3>
        <div className="subtle">Keep a quick log of what you spent.</div>
      </div>

      <div className="inputs">
        <input
          className="field amount"
          type="number"
          placeholder="Amount (e.g. 12.50)"
          value={amountValue}
          onChange={(e) => setAmountValue(e.target.value)}
          required
          min="0"
          step="0.01"
        />

        <input
          className="field"
          type="text"
          placeholder="Category — e.g. Groceries"
          value={categoryValue}
          onChange={(e) => setCategoryValue(e.target.value)}
          required
        />

        <input
          className="field"
          type="text"
          placeholder="Short note (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />

        <input
          className="field"
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          max={todayMax}
          required
        />
      </div>

      {errorMessage && <div className="form-error" style={{ color: '#ffb4b4', marginTop: 8 }}>{errorMessage}</div>}

      <div className="form-actions">
        <button className="btn primary" type="submit">{expense ? 'Save changes' : 'Add'}</button>
      </div>
    </form>
  );
};

export default ExpenseForm;
