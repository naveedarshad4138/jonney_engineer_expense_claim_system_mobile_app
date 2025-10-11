import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import  useApi  from '../../hooks/useApi';
import './Login.css';
import { Alert } from '../../components/Alert/Alert';

export const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { postData, setToken, status, loading } = useApi(); // 👈 include error
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    const loginData = { email, password };

    const response = await postData(
      'auth/login',
      loginData,
      'Login successful!',
      'Email or Password invalid!'
    );

    if (response && response.token) {
      setToken(response.token, response.expiresIn);
      navigate('/dashboard');
    } 
  };
// console.log(status)
  return (
    <div className='login-page'>
    <div className={`login-container`}>
      {/* <div className="left-panel">
        <div className="logo">Hello, ADML</div>
        <div className="tagline">
          Streamline deal submission and underwriting with Steddy’s powerful AI
        </div>
        <ul className="features">
          <li>AI based underwriting and background</li>
          <li>Quick and reliable information at your fingertips</li>
          <li>AI Deep search and discovery</li>
          <li>Steady funds, Steady growth, always</li>
        </ul>
      </div> */}

      <div className="right-panel">
        <div className="login-header">
          <h2>Welcome ABML</h2>
          <p>Sign in to access your ABML Admin dashboard</p>
        </div>

        {/* 🔥 Show login error */}
        {status && (
            <Alert data={status} />
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              placeholder="Enter your business email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <span className="password-toggle" onClick={togglePasswordVisibility}>
                {showPassword ? '🙈' : '👁️'}
              </span>
            </div>
          </div>

          {/* <div className="form-actions">
            <a href="/email_confirmation">Forgot Password?</a>
          </div> */}

          <button type="submit" className="login-btn">
           {loading ? 'Processing': 'Sign In to Dashboard'}
          </button>
        </form>
      </div>
    </div>
    </div>
  );
};

