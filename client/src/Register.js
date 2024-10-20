import { useState, useContext } from 'react';
import axios from 'axios';
import UserContext from "./UserContext";
import { useNavigate } from "react-router-dom"; // Use useNavigate instead of Redirect

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [registerError, setRegisterError] = useState(false); // Error state for registration

  const user = useContext(UserContext);
  const navigate = useNavigate(); // Initialize navigate

  function registerUser(e) {
    e.preventDefault();

    const data = { email, password };
    axios.post('http://localhost:4000/register', data, { withCredentials: true })
      .then(response => {
        user.setEmail(response.data.email);
        setEmail('');
        setPassword('');
        setRegisterError(false);
        navigate('/'); // Redirect to home after successful registration
      })
      .catch(() => {
        setRegisterError(true); // Show error if registration fails
      });
  }

  return (
    <form onSubmit={registerUser}>
      {registerError && (
        <div style={{ color: 'red' }}>REGISTRATION ERROR! Please try again.</div>
      )}
      <input 
        type="email" 
        placeholder="Email" 
        value={email} 
        onChange={e => setEmail(e.target.value)} 
        required 
      /><br />
      <input 
        type="password" 
        placeholder="Password" 
        value={password} 
        onChange={e => setPassword(e.target.value)} 
        required 
      /><br />
      <button type="submit">Register</button>
    </form>
  );
}

export default Register;
