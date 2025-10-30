import React, { useEffect, useState } from 'react'
import useApi from '../../hooks/useApi';
import {Link, useNavigate} from 'react-router-dom';
import { Alert } from '../Alert/Alert';
export const UserForm = ({ id }) => {
    const navigate = useNavigate();
    const { fetchData, updateData, postData, status, setStatus,loading } = useApi();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        // password: '123',
        currentFloat: '',
        role: 'Admin',
    });

    // If editing, fetch user data
    useEffect(() => {
        if (id) {
            (async () => {
                const res = await fetchData(`auth/user/${id}`);
                if (res?.results) {
                    setFormData(res?.results);
                    setStatus(null);
                }
            })();
        }
    }, [id]);

    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log(formData)

        if (id) {
            // Editing
            await updateData(`auth/user/${id}`, formData, `User Updated successfully!`,'Failed to update data!');
        } else {
            // Adding
            await postData(`auth/register`, formData, `User added successfully! A password setup email has been sent to ${formData?.email}`,'Failed to add data!');
        }

        // navigate('/manage-users'); // or wherever you want to redirect after submit
    };
    console.log(formData)
    return (
        <>
        {status && <Alert data={status} />}
        <div className="application-form">
           
            <div className="form-header">
                <h2>Enter User Details Here</h2>
                {
                    id ? <p>Update user information</p> : <p>Add information about the new user</p>
                }

            </div>

            <form id="business-form" onSubmit={handleSubmit}>
                <div className="form-section">
                    <div className="section-title">Enter Details</div>

                    <div className="form-group">
                        <label htmlFor="username">Full Name</label>
                        <input type="text" id="username" name="username" placeholder="Enter Full Name" value={formData.username}
                            onChange={handleChange}
                            required="" />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input type="email" id="email" name="email" placeholder="Enter Email Address" value={formData.email}
        onChange={handleChange} required="" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="currentFloat">Balance</label>
                        <input type="number" id="currentFloat" name="currentFloat" placeholder="Enter balance" value={formData.currentFloat ?? ''}
                            onChange={handleChange}
                            required="" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="role">Role</label>
                        <select id="role" name="role" required="" value={formData.role} onChange={handleChange} >
                            <option value="">Select Role</option>
                            <option value="User">
                                User</option>
                            <option value="Admin" selected>Admin</option>
                        </select>
                    </div>
                </div>


                <div className="form-actions" style={{ display: "flex", "flexDirection": "column", "gap": "10px", "marginTop": "20px" }}>
                    <button className="submit-btn" id="submitBtn" disabled={loading}>
                        {loading ? 'Loading...' : id ? 'Update User' : 'Add User'}
                        {/* {id ? 'Update User':'Add User'} */}
                    </button>
                    <Link to="/manage-users" className="btn btn-secondary go-back-btn">
                        Back to Users
                    </Link>
                </div>
            </form>
        </div>
        </>
        
    )
}
