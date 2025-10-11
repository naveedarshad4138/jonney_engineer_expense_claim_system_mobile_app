import React, { useState, useEffect } from 'react';
import './PasswordManager.css';
import { useNavigate, useLocation } from 'react-router-dom';
import useApi from '../../hooks/useApi';
import { Alert } from '../../components/Alert/Alert';
import { Layout } from '../Layout/Layout';
import { removeToken } from '../../utils/customFunctions';

export const PasswordManager = () => {
    const [crpassword, setcrpassword] = useState('');
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

    const { updateData,loading, status } = useApi();
    const navigate = useNavigate();



    const togglePasswordVisibility = (field) => {
        if (field === 'password') setShowPassword(prev => !prev);
        else setShowCPassword(prev => !prev);
    };

    const isFormValid = () =>
        Object.values(requirements).every(Boolean) && password === cpassword;

    const handleResetPassword = async (e) => {
        e.preventDefault();

        const data = { newPassword:password, currentPassword: crpassword };
        try{
            const response = await updateData(
                'auth/user/password/update',
                data,
                'Password Updated successfully!',
                'Current password invlaid!'
            );

            // if (status?.type === true) {
            //     // removeToken();
            //     navigate('/login');
            // }
        } catch (error) {
            console.error('❌ Error updating password:', error);
        }

    };
    // Decode JWT token from query param
    //   useEffect(() => {
    //     const queryParams = new URLSearchParams(location.search);
    //     const token = queryParams.get('token');
    //     const payloadBase64 = token.split('.')[1];
    //     const decodedPayload = JSON.parse(atob(payloadBase64));
    //     setOtp(decodedPayload.otp);
    //     setEmail(decodedPayload.email);

    //   }, []);

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
        <Layout page='passwordManager'>
            {status && <Alert data={status} /> }
            <div className="application-form">
                <form id="business-form" onSubmit={handleResetPassword}>
                    <div className="form-section">
                        <div className="section-title">You can reset your password here!</div>

                        <div className="form-group">
                            <label htmlFor="current_password">Current Password *</label>

                            <div className="password-field position-relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="crpassword"
                                    value={crpassword}
                                    onChange={(e) => setcrpassword(e.target.value)}
                                    required
                                />
                                <span className="password-toggle" onClick={() => togglePasswordVisibility('password')}>
                                    {showPassword ? '🙈' : '👁️'}
                                </  span>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="new_password">New Password *</label>
                            <div className="password-field position-relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <span className="password-toggle" onClick={() => togglePasswordVisibility('password')}>
                                    {showPassword ? '🙈' : '👁️'}
                                </  span>
                            </div>
                            <div className="password-validation" id="password-validation">
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

                        <div className="form-group">
                            <label htmlFor="confirm_password">Confirm New Password *</label>
                            <div className="password-field position-relative">
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
                    </div>

                    <button type="submit" className="submit-btn cbutton" id="submitBtn" disabled={!isFormValid()}>
                       {loading ? 'Updating': 'Update Password'} 
                    </button>
                </form>

            </div>

        </Layout>
    );
};
