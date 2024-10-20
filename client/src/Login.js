import { useState, useContext } from 'react';
import axios from 'axios';
import UserContext from "./UserContext";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(false);
  
  const user = useContext(UserContext);
  const navigate = useNavigate(); // Use useNavigate for redirection

  function loginUser(e) {
    e.preventDefault();

    const data = { email, password };
    axios.post('http://localhost:4000/login', data, { withCredentials: true })
      .then(response => {
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
    <form onSubmit={loginUser}>
      {loginError && (
        <div>LOGIN ERROR! WRONG EMAIL OR PASSWORD!</div>
      )}
      <input 
        type="email" 
        placeholder="Email" 
        value={email} 
        onChange={e => setEmail(e.target.value)} 
      /><br />
      <input 
        type="password" 
        placeholder="Password" 
        value={password} 
        onChange={e => setPassword(e.target.value)} 
      /><br />
      <button type="submit">Log In</button>
    </form>
  );
}

export default Login;
