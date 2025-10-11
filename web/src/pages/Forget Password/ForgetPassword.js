import React, { useState } from 'react';
import './ForgetPassword.css';
import useApi from '../../hooks/useApi'; // Import your custom hook

///////////// Icons /////////////////

import { useNavigate } from 'react-router-dom';
import { Alert } from '../../components/Alert/Alert';

export const ForgetPassword = () => {
  const [email, setEmail] = useState('');
  const { data, status, setStatus, loading, error, postData, setToken } = useApi();


const handleSendOtp = async (e) => {
    e.preventDefault();
    const otpData = {
      email,
    };
    // Use the createData method from useApi to send the OTP request
    await postData('auth/send-otp', otpData, 'OTP sent successfully!', 'Failed to send OTP!');  
  }
  return (
    <div className='login-page'>
    <div className="right-panel">
      <div className="login-header">
        <h2>Reset Password</h2>
        <p>Enter your email here to get the verification email at you address</p>
      </div>

      {status && (
        <Alert data={status} />
      )}

      <form onSubmit={handleSendOtp} id="resetForm">
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

        <button
          type="submit"
          className="login-btn"
          disabled={loading}
        >
          {loading ? 'Sending Email... ⏳' : 'Email Sent!'}
        </button>
      </form>
    </div>
    </div>
  );
};