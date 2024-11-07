import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebaseConfig';
import { Link, useNavigate } from 'react-router-dom';
import style from '../Styles/Login.module.css';
import { toast, ToastContainer } from 'react-toastify';
import { getDoc, doc } from 'firebase/firestore';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
  
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      if (user && user.uid) {
        // Check if db is properly initialized
        console.log("Firestore instance:", db);
  
        // Fetch user document from Firestore
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
  
        if (userDoc.exists()) {
          const userData = userDoc.data();
          console.log("User Data:", userData);  // Logging user data for verification
          localStorage.setItem('user', JSON.stringify({ uid: user.uid, email: user.email }));
          // You can save other details like recommendations if needed
          // localStorage.setItem('recommendations', JSON.stringify(userData.recommendations));
        } else {
          console.error("No document found for user with UID:", user.uid);
          toast.error("User document not found.", { position: "top-center" });
        }
      }
  
      toast.success("Login successful", { position: "top-center" });
      navigate('/home');
    } catch (error) {
      setError(error.message);
      toast.error("Login failed", { position: "top-center" });
      console.error("Login error:", error);
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
      <ToastContainer />
    </div>
  );
}

export default Login;
