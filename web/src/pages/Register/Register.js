import React, { useState, useContext } from 'react';
import './Register.css';
import ThemeToggle from '../../components/ThemeToggle/ThemeToggle';
import { ThemeContext } from '../../context/ThemeContext';
import useApi from '../../hooks/useApi'; // Import your custom hook

///////////// Icons /////////////////
import { BiHide } from "react-icons/bi";
import { BiShow } from "react-icons/bi";
import { useNavigate } from 'react-router-dom';

export const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [cpassword, setCPassword] = useState('');
  const { isDarkTheme } = useContext(ThemeContext);
  const { data, status, loading, error, postData, setToken } = useApi();
  const navigate = useNavigate();


  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const registerData = {
      username, // Assuming username is the same as email for registration
      email,
      password,
      cpassword
    };

    console.log(registerData)
    // Use the createData method from useApi to send the register request
    const response = await postData('auth/register', registerData, 'Register successful!', 'Register failed!');

    // If register is successful, store the token and redirect to the dashboard
    if (response && response.token) {
      setToken(response.token, response.expiresIn); // Store the token and expiry time
      navigate('/dashboard'); // Redirect to the dashboard
    }
  };

  return (
    <div className={`register-container ${isDarkTheme ? 'dark-theme' : 'light-theme'}`}>
      <div className="register-box">
        {/* <ThemeToggle /> */}
        {/* Avatar/Logo */}
        <div className="avatar">
          <img
            src="https://static.vecteezy.com/system/resources/thumbnails/038/516/357/small_2x/ai-generated-eagle-logo-design-in-black-style-on-transparant-background-png.png" // Replace with your logo URL
            alt="Logo"
          />
        </div>

        <h2>Register</h2>
        <form onSubmit={handleRegister} className='row'>
          <div className="col-6">
            <div className="input-group username">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="col-6">
            <div className="input-group email">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="col-6">
            <div className="input-group">
              <label htmlFor="password">Password</label>
              <div className="password-input">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <span
                  className="toggle-password"
                  onClick={togglePasswordVisibility}
                >
                  {/* Eye Cut SVG Icon */}
                  {showPassword ? <BiShow /> : <BiHide />}
                </span>
              </div>
            </div>
          </div>
          <div className="col-6">
            <div className="input-group">
              <label htmlFor="cpassword">Confirm Password</label>
              <div className="cpassword-input position-relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="cpassword"
                  name="cpassword"
                  value={cpassword}
                  onChange={(e) => setCPassword(e.target.value)}
                  required
                />
                <span
                  className="toggle-password"
                  onClick={togglePasswordVisibility}
                >
                  {/* Eye Cut SVG Icon */}
                  {showPassword ? <BiShow /> : <BiHide />}
                </span>
              </div>
            </div>
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Register'}
          </button>
        </form>

        {/* Display error message if any */}
        {/* {error && <p className="error-message">{error}</p>} */}

        {/* Forgot Password and Sign Up Links */}
        <div className="links">
          <a className={`text-${status?.type}`}>{status?.message}</a>
          <a href="/login">If you have an account? Login now</a>
        </div>
      </div>
    </div>
  );
};