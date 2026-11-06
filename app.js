const form = document.querySelector('#todo-form');
const input = document.querySelector('#todo-input');
const list = document.querySelector('#todo-list');
const clearButton = document.querySelector('#clear-completed');
const storageKey = 'my-todo-app.tasks';
let todos = [];

try {
  const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
  if (Array.isArray(saved)) {
    todos = saved.filter(task => task && typeof task.id === 'string' && typeof task.text === 'string' && typeof task.completed === 'boolean');
  }
} catch { /* The app also works when browser storage is unavailable. */ }

function save() {
  try { localStorage.setItem(storageKey, JSON.stringify(todos)); } catch { /* Keep tasks in memory. */ }
}

function announce(message) {
  document.querySelector('#announcement').textContent = message;
}

function render() {
  list.replaceChildren();
  todos.forEach(task => {
    const item = document.createElement('li');
    item.className = `todo-item${task.completed ? ' completed' : ''}`;
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `todo-${task.id}`;
    checkbox.checked = task.completed;
    const label = document.createElement('label');
    label.htmlFor = checkbox.id;
    label.textContent = task.text;
    checkbox.addEventListener('change', () => {
      task.completed = checkbox.checked;
      save();
      render();
      document.getElementById(checkbox.id)?.focus();
      announce(task.completed ? 'Task completed.' : 'Task marked incomplete.');
    });
    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.className = 'delete-button';
    deleteButton.setAttribute('aria-label', `Delete ${task.text}`);
    deleteButton.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7"/></svg>';
    deleteButton.addEventListener('click', () => {
      const index = todos.indexOf(task);
      todos = todos.filter(todo => todo !== task);
      save();
      render();
      const nextItem = list.children[Math.min(index, todos.length - 1)];
      (nextItem?.querySelector('.delete-button') || input).focus();
      announce('Task deleted.');
    });
    item.append(checkbox, label, deleteButton);
    list.append(item);
  });
  const completed = todos.filter(task => task.completed).length;
  document.querySelector('#task-count').textContent = `${todos.length - completed} remaining`;
  document.querySelector('#empty-state').hidden = todos.length > 0;
  document.querySelector('#progress').textContent = todos.length ? `${completed} of ${todos.length} completed` : 'Small steps. Good things.';
  clearButton.hidden = completed === 0;
}

form.addEventListener('submit', event => {
  event.preventDefault();
  const text = input.value.trim();
  if (!text) {
    input.setCustomValidity('Please enter a task.');
    input.reportValidity();
    return;
  }
  todos.push({ id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, text, completed: false });
  save();
  render();
  form.reset();
  input.focus();
  announce('Task added.');
});
input.addEventListener('input', () => input.setCustomValidity(''));
clearButton.addEventListener('click', () => {
  todos = todos.filter(task => !task.completed);
  save();
  render();
  input.focus();
  announce('Completed tasks cleared.');
});
render();
