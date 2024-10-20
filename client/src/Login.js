import { useState, useContext } from 'react';
import axios from 'axios';
import UserContext from "./UserContext";
import { useNavigate } from "react-router-dom";

function Login() {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(false);

  const user = useContext(UserContext);
  const navigate = useNavigate();  // Replaces Redirect

  function loginUser(e) {
    e.preventDefault();

    const data = { email, password };
    axios.post('http://localhost:4000/login', data, { withCredentials: true })
      .then(response => {
        user.setEmail(response.data.email);
        setEmail('');
        setPassword('');
        setLoginError(false);
        navigate('/');  // Redirect to home after successful login
      })
      .catch(() => {
        setLoginError(true);  // Show error if login fails
      });
  }

  return (
    <form onSubmit={loginUser}>
      {loginError && (
        <div style={{ color: 'red' }}>LOGIN ERROR! WRONG EMAIL OR PASSWORD!</div>
      )}
      <input 
        type="email" 
        placeholder="email" 
        value={email} 
        onChange={e => setEmail(e.target.value)} 
        required
      /><br />
      <input 
        type="password" 
        placeholder="password" 
        value={password} 
        onChange={e => setPassword(e.target.value)} 
        required
      /><br />
      <button type="submit">Log In</button>
    </form>
  );
}

export default Login;
