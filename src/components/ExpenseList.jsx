import ExpenseItem from './ExpenseItem';

const ExpenseList = ({ expenses, onEdit, onDelete }) => {
  const count = Array.isArray(expenses) ? expenses.length : 0;

  return (
    <section className="expenses">
      <div className="expenses-header">
        <h2>Activity</h2>
        <div className="subtle">{count} {count === 1 ? 'entry' : 'entries'}</div>
      </div>

      {count === 0 ? (
        <div className="empty">No expenses yet — add one to get started.</div>
      ) : (
        <ul className="expenses-list">
          {expenses.map((expense) => (
            <ExpenseItem
              key={expense.id}
              expense={expense}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </ul>
      )}
    </section>
  );
};

export default ExpenseList;
