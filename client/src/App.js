import './App.css';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Register from './Register';
import UserContext from './UserContext';
import axios from 'axios';
import Login from './Login';
import Home from './Home';

function App() {
  const [email, setEmail] = useState('');

  useEffect(() => {
    axios
      .get('http://localhost:4000/user', { withCredentials: true })
      .then((response) => {
        setEmail(response.data.email);
      })
      .catch((error) => {
        console.error('Error fetching user data', error);
      });
  }, []);

  function logout() {
    axios
      .post('http://localhost:4000/logout', {}, { withCredentials: true })
      .then(() => setEmail(''))
      .catch((error) => {
        console.error('Error logging out', error);
      });
  }

  return (
    <UserContext.Provider value={{ email, setEmail }}>
      <Router>
        <nav>
          <Link to="/">Home</Link>
          {!email && (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
          {!! email && (
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                logout();
              }}
            >
              Logout
            </a>
          )}
        </nav>
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </main>
      </Router>
    </UserContext.Provider>
  );
}
export default App;
