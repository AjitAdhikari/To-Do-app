import '@/styles/globals.css';
import React, { useState } from 'react';
import { useRouter } from 'next/router';

const Home = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleSubmit = async () => {
    if (!username || !password) {
      setMessage("Username and password can't be empty");
      return;
    }

    if (isLogin) {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('Login successful!');
        localStorage.setItem('user', JSON.stringify(data.user));
        setTimeout(() => router.push('/tasklist'), 1000);
      } else {
        setMessage('Invalid username or password');
      }
    } else {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('Signup successful! Please login.');
        setIsLogin(true);
        setUsername('');
        setPassword('');
      } else {
        setMessage('Signup failed: ' + data.message);
      }
    }
  };

  return (
    <div className="container">
      <h2>{isLogin ? 'Login' : 'Signup'}</h2>

      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="input"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="input"
      />

      <button onClick={handleSubmit} className="button">
        {isLogin ? 'Login' : 'Signup'}
      </button>

      <p>
        {isLogin ? "Don't have an account?" : 'Already a user?'}{' '}
        <span onClick={() => setIsLogin(!isLogin)} className="toggle">
          {isLogin ? 'Signup' : 'Login'}
        </span>
      </p>

      {message && (
        <p className={`message ${message.toLowerCase().includes('successful') ? 'success' : ''}`}>
          {message}
        </p>
      )}
    </div>
  );
};

export default Home;
