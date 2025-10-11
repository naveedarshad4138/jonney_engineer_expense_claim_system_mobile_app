import React, { useState, useEffect } from 'react';
import './ChangePassword.css';
import { useNavigate, useLocation } from 'react-router-dom';
import useApi from '../../hooks/useApi';
import { Alert } from '../../components/Alert/Alert';

export const ChangePassword = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [cpassword, setCPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showCPassword, setShowCPassword] = useState(false);
  const [requirements, setRequirements] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
  });

  const { postData, status } = useApi();
  const navigate = useNavigate();
  const location = useLocation();

  

  const togglePasswordVisibility = (field) => {
    if (field === 'password') setShowPassword(prev => !prev);
    else setShowCPassword(prev => !prev);
  };

  const isFormValid = () =>
    Object.values(requirements).every(Boolean) && password === cpassword;

  const handleResetPassword = async (e) => {
    e.preventDefault();

    const data = { email, otp, password, cpassword };
    const response = await postData(
      'auth/verify-otp',
      data,
      'Password reset successfully!',
      'Invalid or expired OTP!'
    );

    if (response?.status === 200) {
      navigate('/login');
    }
  };
// Decode JWT token from query param
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get('token');
    const payloadBase64 = token.split('.')[1];
    const decodedPayload = JSON.parse(atob(payloadBase64));
    setOtp(decodedPayload.otp);
    setEmail(decodedPayload.email);

  }, []);

  // Password requirement checker
  useEffect(() => {
    setRequirements({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
    });
  }, [password]);
  return (
    <div className='login-page'>
    <div className="right-panel">
      <div className="login-header">
        <h2>Set Your Password</h2>
        <p>Create a secure password for your Steddy account</p>
      </div>

      {email && (
        <div className="user-info">
          <h4>Welcome!</h4>
          <p>Resetting password for: <strong>{email}</strong></p>
        </div>
      )}
      <form onSubmit={handleResetPassword} id="passwordForm">
        {/* New Password */}
        <div className="form-group password-wrapper">
          <label htmlFor="password">New Password</label>
          <div className="passHide position-relative">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span className="password-toggle" onClick={() => togglePasswordVisibility('password')}>
              {showPassword ? '🙈' : '👁️'}
            </span>
          </div>

          <div className="password-requirements">
            <span className={`requirement ${requirements.length ? 'valid' : ''}`}>
              • At least 8 characters
            </span>
            <span className={`requirement ${requirements.uppercase ? 'valid' : ''}`}>
              • One uppercase letter
            </span>
            <span className={`requirement ${requirements.lowercase ? 'valid' : ''}`}>
              • One lowercase letter
            </span>
            <span className={`requirement ${requirements.number ? 'valid' : ''}`}>
              • One number
            </span>
          </div>
        </div>

        {/* Confirm Password */}
        <div className="form-group password-wrapper">
          <label htmlFor="confirm_password">Confirm Password</label>
          <div className="passHide position-relative">
            <input
              type={showCPassword ? 'text' : 'password'}
              id="confirm_password"
              value={cpassword}
              onChange={(e) => setCPassword(e.target.value)}
              required
              className='mb-2'
            />
            <span className="password-toggle" onClick={() => togglePasswordVisibility('confirm')}>
              {showCPassword ? '🙈' : '👁️'}
            </span>
          </div>
          {cpassword && password !== cpassword && (
            <Alert data={{ type: false, message: 'Passwords do not match' }} />
            
          )}
          {
            status && (
            <Alert data={status} />
            
          )
          }
        </div>

        <button type="submit" className="login-btn" disabled={!isFormValid()}>
          Set Password
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <a href="/login" className="resend-link">Back to Login</a>
      </div>
    </div>
    </div>
  );
};
