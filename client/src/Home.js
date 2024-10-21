import { useContext, useEffect, useState } from 'react';
import UserContext from './UserContext';
import axios from 'axios';
import './Home.css';

function Home() {
  const userInfo = useContext(UserContext);
  const [inputVal, setInputVal] = useState('');
  const [todos, setTodos] = useState([]);

  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const response = await axios.get('http://localhost:4000/todos', {
          withCredentials: true,
        });
        setTodos(response.data);
      } catch (error) {
        console.error('Error fetching todos:', error);
      }
    };

    fetchTodos();
  }, []);

  if (!userInfo.email) {
    return (
      <div className="home-login-message">
        <p className="alert alert-warning text-center">
          Please Login to View Your Todo-List
        </p>
      </div>
    );
  }

  const addTodo = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        'http://localhost:4000/todos',
        {
          text: inputVal,
        },
        { withCredentials: true }
      );
      console.log('Todo added:', response.data);
      setTodos((prevTodos) => [...prevTodos, response.data]);
      setInputVal('');
    } catch (error) {
      console.error('Error adding todo:', error);
    }
  };

  const updateTodo = async (todo) => {
    const data = { id: todo._id, done: !todo.done };
    try {
      await axios.post('http://localhost:4000/todos', data, {
        withCredentials: true,
      });
      setTodos((prevTodos) =>
        prevTodos.map((t) => (t._id === todo._id ? { ...t, done: !t.done } : t))
      );
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  };

  const deleteTodo = async (todoId) => {
    try {
      await axios.delete(`http://localhost:4000/todos/${todoId}`, {
        withCredentials: true,
      });
      setTodos((prevTodos) => prevTodos.filter((todo) => todo._id !== todoId));
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  return (
    <div className="home-container">
      <div className="home-header text-center">
        <h2>Todo List</h2>
      </div>
      <form onSubmit={addTodo} className="home-form input-group mb-3">
        <div>
          <input
            type="text"
            className="form-control"
            placeholder="What do you want to do?"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
          />
          <button type="submit" className="btn btn-primary btn-sm">
            Add
          </button>
        </div>
      </form>
      <ul className="list-group home-todo-list">
        {todos.map((todo) => (
          <li
            key={todo._id}
            className="list-group-item d-flex justify-content-between align-items-center"
          >
            <div>
              <input
                type="checkbox"
                className="form-check-input"
                checked={todo.done}
                onChange={() => updateTodo(todo)}
              />
              <span className={todo.done ? 'text-decoration-line-through' : ''}>
                {todo.text}
              </span>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => deleteTodo(todo._id)}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Home;
