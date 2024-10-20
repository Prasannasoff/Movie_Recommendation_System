import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import style from '../Styles/Login.module.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();


  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/home'); 
    } catch (error) {
      setError(error.message); 
    }
  };

  return (
    <div className={style.loginCont}>
      <div className={style.formWrapper}>
        <h2>Sign In</h2>
        <form onSubmit={handleLogin}>
          <div className={style.formControl}>
            <input
              type="text"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)} 
            />
            <label>Email or phone number</label>
          </div>
          <div className={style.formControl}>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <label>Password</label>
          </div>
          {error && <p className={style.error}>{error}</p>} 
          <button type="submit">Sign In</button>
          <div className={style.formHelp}>
            <div className={style.rememberMe}>
              <input type="checkbox" id="remember-me" />
              <label htmlFor="remember-me">Remember me</label>
            </div>
            <p>Not registered? <Link to='/register'>Sign up</Link></p>  
          </div>
        </form>
       
      
      </div>
    </div>
  );
}

export default Login;
