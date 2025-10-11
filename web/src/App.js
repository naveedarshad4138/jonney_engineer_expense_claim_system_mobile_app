import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import './App.css'; 

import {Dashboard} from './pages/Dashboard/Dashboard';
import { Login } from './pages/Login/Login';
import { ThemeProvider } from './context/ThemeContext';
import { Register } from './pages/Register/Register';
import { ForgetPassword } from './pages/Forget Password/ForgetPassword';
import { ChangePassword } from './pages/Change Password/ChangePassword';
import { ViewExpenseClaim } from './pages/ViewExpenseClaim/ViewExpenseClaim';
import { ManageSearch } from './pages/ManageSearch/ManageSearch';
import { PasswordManager } from './pages/PasswordManager/PasswordManager';
import { ManageUsers } from './pages/User/ManageUsers/ManageUsers';
import { AddEditUserForm } from './pages/User/AddUser/AddEditUserForm';
import { Test } from './pages/User/AddUser/Test';


const App = () => (
  <ThemeProvider>
  <Router>
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      {/* <Route path="/register" element={<Register /> } /> */}
      <Route path="/email_confirmation" element={<ForgetPassword /> } />
      <Route path="/reset_password" element={<ChangePassword /> } />
        <Route path="/test" element={<Test />} />

      {/* Private Routes */}
      <Route element={<PrivateRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        {/* <Route path="/expense-history" element={<FormHistory />} /> */}
        <Route path="/expense-history" element={<ManageSearch />} />
        <Route path="/expense/:id" element={<ViewExpenseClaim />} />
        <Route path="/password-manager" element={<PasswordManager />} />
        <Route path="/manage-users" element={<ManageUsers />} />
        <Route path="/add-user" element={<AddEditUserForm />} />
        <Route path="/edit-user/:id" element={<AddEditUserForm />} />
      </Route>

      {/* Default Route (Redirect to Login if no match) */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  </Router>
  </ThemeProvider>
);

export default App;