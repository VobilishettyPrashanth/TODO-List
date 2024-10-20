import { useContext, useEffect, useState } from 'react';
import UserContext from './UserContext';
import axios from 'axios';

function Home() {
  const userInfo = useContext(UserContext);
  const [inputVal, setInputVal] = useState('');
  const [todos, setTodos] = useState([]);

  useEffect(() => {
    axios
      .get('http://localhost:4000/todos', { withCredentials: true })
      .then((response) => {
        setTodos(response.data);
      })
      .catch((error) => {
        console.error('Error fetching todos', error);
      });
  }, []);

  if (!userInfo.email) {
    return 'You need to be logged in to see this page';
  }

  function addTodo(e) {
    e.preventDefault();
    axios
      .put(
        'http://localhost:4000/todos',
        { text: inputVal },
        { withCredentials: true }
      )
      .then((response) => {
        setTodos((prevTodos) => [...prevTodos, response.data]);
        setInputVal('');
      })
      .catch((error) => {
        console.error('Error adding todo', error);
      });
  }

  function updateTodo(todo) {
    const data = { id: todo._id, done: !todo.done };
    axios
      .post('http://localhost:4000/todos', data, { withCredentials: true })
      .then(() => {
        setTodos((prevTodos) =>
          prevTodos.map((t) =>
            t._id === todo._id ? { ...t, done: !t.done } : t
          )
        );
      })
      .catch((error) => {
        console.error('Error updating todo', error);
      });
  }

  return (
    <div>
      <form onSubmit={addTodo}>
        <input
          placeholder="What do you want to do?"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
        />
      </form>
      <ul>
        {todos.map((todo) => (
          <li key={todo._id}>
            <input
              type="checkbox"
              checked={todo.done}
              onChange={() => updateTodo(todo)}
            />
            {todo.done ? <del>{todo.text}</del> : todo.text}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Home;
