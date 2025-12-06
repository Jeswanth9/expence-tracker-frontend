import { useState, useEffect } from 'react';
import ExpenseForm from './ExpenseForm';
import ExpenseList from './ExpenseList';
import Summary from './Summary';

const Expenses = ({ token, onLogout }) => {
  const [items, setItems] = useState([]);
  const [activeItem, setActiveItem] = useState(null);
  const apiBase = import.meta.env.VITE_API_BASE;

  // load items from the API
  const loadItems = async () => {
    const { res, body } = await (await import('../utils/api')).apiFetch(`${apiBase}/expenses`, {
      headers: { Authorization: `Bearer ${token}` },
    }, onLogout);

    if (!res.ok) {
      // if token expired, apiFetch already called onLogout; otherwise keep items empty
      setItems([]);
      return;
    }

    const data = body;
    if (Array.isArray(data)) data.sort((a, b) => Number(b.id) - Number(a.id));
    setItems(data || []);
  };

  useEffect(() => {
    if (token) loadItems();
  }, [token]);

  const afterSave = () => {
    setActiveItem(null);
    loadItems();
  };

  const removeItem = async (id) => {
    const { res } = await (await import('../utils/api')).apiFetch(`${apiBase}/expenses/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    }, onLogout);

    if (res.ok) loadItems();
  };

  return (
    <div className="ui-root">
      <main className="ui-container main-grid">
        <div className="left-col">
          <ExpenseForm token={token} expense={activeItem} onSave={afterSave} onLogout={onLogout} />
        </div>

        <div className="right-col">
          <Summary
            total={items.reduce((s, e) => s + Number(e.amount || 0), 0)}
            count={items.length}
          />

          <ExpenseList
            expenses={items}
            onEdit={setActiveItem}
            onDelete={removeItem}
          />
        </div>
      </main>
    </div>
  );
};

export default Expenses;
