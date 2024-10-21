import { useState, useContext } from 'react';
import axios from 'axios';
import UserContext from './UserContext';
import { useNavigate } from 'react-router-dom';
import './login.css';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [registerError, setRegisterError] = useState(false);

  const user = useContext(UserContext);
  const navigate = useNavigate();

  function registerUser(e) {
    e.preventDefault();

    const data = { email, password };
    axios
      .post('http://localhost:4000/register', data, { withCredentials: true })
      .then((response) => {
        user.setEmail(response.data.email);
        setEmail('');
        setPassword('');
        setRegisterError(false);
        navigate('/');
      })
      .catch(() => {
        setRegisterError(true);
      });
  }
  
  return (
    <div className="login-container">
      <form onSubmit={registerUser}>
        {registerError && (
          <div className="error-message">
            REGISTRATION ERROR! Please try again.
          </div>
        )}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="input-field"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="input-field"
        />
        <button type="submit" className="submit-button">
          Register
        </button>
      </form>
    </div>
  );
}

export default Register;
