import React, { useState, useEffect } from 'react';
import Header from '../../components/Header/Header';
import Sidebar from '../../components/Sidebar/Sidebar';
import { decodeBase64, getToken, removeToken } from '../../utils/customFunctions.js';
import {jwtDecode} from 'jwt-decode';


export const Layout = ({ children, page }) => {
  const [userData, setUserData] = useState(null);
   useEffect(() => {
    const etoken = getToken();
    const decodedJson = decodeBase64(etoken); // your base64 decode function
    const { token } = JSON.parse(decodedJson);
    if (token) {
      const payload = jwtDecode(token)?.user;
      if (payload) {
        const userInfo = {
          username: payload.username || '',
          role: payload.role || ''
        };
        setUserData(userInfo);
      }
    }
  }, []);

  return (
    <div className="dashboard-container">
      <Sidebar logout={removeToken} user={userData} page={page} />
      <div className="main-content">
        <Header page={page} logout={removeToken} user={userData} />
        {children}
      </div>
    </div>
  );
};
