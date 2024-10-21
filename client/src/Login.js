import { useState, useContext } from 'react';
import axios from 'axios';
import UserContext from './UserContext';
import { useNavigate } from 'react-router-dom';
import './login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(false);

  const user = useContext(UserContext);
  const navigate = useNavigate(); 

  function loginUser(e) {
    e.preventDefault();

    const data = { email, password };
    axios
      .post('http://localhost:4000/login', data, { withCredentials: true })
      .then((response) => {
        user.setEmail(response.data.email);
        setEmail('');
        setPassword('');
        setLoginError(false);
        navigate('/'); // Navigate to home on successful login
      })
      .catch(() => {
        setLoginError(true);
      });
  }

  return (
    <div className="login-container">
      <form onSubmit={loginUser}>
        {loginError && (
          <div className="error-message">
            LOGIN ERROR! WRONG EMAIL OR PASSWORD!
          </div>
        )}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input-field"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input-field"
        />
        <button type="submit" className="submit-button">
          Log In
        </button>
      </form>
    </div>
  );
}

export default Login;
