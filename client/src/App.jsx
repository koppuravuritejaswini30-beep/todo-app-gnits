import { useEffect, useState } from "react";
import {
  getTodos,
  createTodo,
  updateTodo,
  deleteTodo,
} from "./api";

import { FILTERS } from "./constants";
import Sidebar from "./components/Sidebar";
import TodoForm from "./components/TodoForm";
import TodoItem from "./components/TodoItem";
import Pagination from "./components/Pagination";

function App() {
  const [todos, setTodos] = useState([]);
  const [filter, setFilter] = useState(FILTERS.ALL);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const tasksPerPage = 10;

  function showError(err) {
    setError(err.message || "Something went wrong");
  }

  // Load todos
  useEffect(() => {
    async function loadTodos() {
      try {
        setLoading(true);
        setError("");

        const data = await getTodos();
        setTodos(data);
      } catch (err) {
        showError(err);
      } finally {
        setLoading(false);
      }
    }

    loadTodos();
  }, []);

  // Add todo
  async function handleAdd(title) {
    try {
      setError("");

      const newTodo = await createTodo(title);

      setTodos((prev) => [newTodo, ...prev]);

      // Go back to first page when adding a new task
      setCurrentPage(1);
    } catch (err) {
      showError(err);
    }
  }

  // Update todo
  async function handleUpdate(id, data) {
    try {
      setError("");

      const updated = await updateTodo(id, data);

      setTodos((prev) =>
        prev.map((todo) =>
          todo._id === id ? updated : todo
        )
      );
    } catch (err) {
      showError(err);
    }
  }

  // Delete todo
  async function handleDelete(id) {
    try {
      setError("");

      await deleteTodo(id);

      setTodos((prev) =>
        prev.filter((todo) => todo._id !== id)
      );
    } catch (err) {
      showError(err);
    }
  }

  // Clear completed todos
  async function handleClearDone() {
    try {
      setError("");

      const completedTodos = todos.filter(
        (todo) => todo.completed
      );

      await Promise.all(
        completedTodos.map((todo) =>
          deleteTodo(todo._id)
        )
      );

      setTodos((prev) =>
        prev.filter((todo) => !todo.completed)
      );

      setCurrentPage(1);
    } catch (err) {
      showError(err);
    }
  }

  // Filter todos
  const filteredTodos = todos.filter((todo) => {
    if (filter === FILTERS.ACTIVE) {
      return !todo.completed;
    }

    if (filter === FILTERS.COMPLETED) {
      return todo.completed;
    }

    return true;
  });

  // Pagination calculations
  const totalPages = Math.ceil(
    filteredTodos.length / tasksPerPage
  );

  const startIndex =
    (currentPage - 1) * tasksPerPage;

  const endIndex =
    startIndex + tasksPerPage;

  const currentTodos = filteredTodos.slice(
    startIndex,
    endIndex
  );

  // If current page becomes invalid after deleting/filtering
  useEffect(() => {
    if (
      totalPages > 0 &&
      currentPage > totalPages
    ) {
      setCurrentPage(totalPages);
    }

    if (totalPages === 0 && currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  // Change filter and return to page 1
  function handleFilterChange(newFilter) {
    setFilter(newFilter);
    setCurrentPage(1);
  }

  const taskWord =
    filteredTodos.length === 1
      ? "task"
      : "tasks";

  function renderTodos() {
    if (loading) {
      return (
        <div className="empty-state">
          Loading...
        </div>
      );
    }

    if (currentTodos.length === 0) {
      return (
        <div className="empty-state">
          <p>No {filter.toLowerCase()} tasks</p>
        </div>
      );
    }

    return currentTodos.map((todo) => (
      <TodoItem
        key={todo._id}
        todo={todo}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />
    ));
  }

  return (
    <div className="app">
      <Sidebar
        filter={filter}
        setFilter={handleFilterChange}
        todos={todos}
        onClearDone={handleClearDone}
      />

      <main className="main">
        <div className="header">
          <div>
            <h1>My Tasks</h1>

            <p>
              {filteredTodos.length} {taskWord}
            </p>
          </div>
        </div>

        {error && (
          <div className="error">
            {error}
          </div>
        )}

        <TodoForm onAdd={handleAdd} />

        <div className="todo-list">
          {renderTodos()}
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </main>
    </div>
  );
}

export default App;