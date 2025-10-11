import React, { useState, useEffect } from 'react';
import { Layout } from '../../Layout/Layout';
import useApi from '../../../hooks/useApi';
import { Alert } from '../../../components/Alert/Alert';
import { UserForm } from '../../../components/Form/UserForm';
import { useNavigate, useParams } from 'react-router-dom';

export const AddEditUserForm = () => {
    const { id } = useParams(); // Will be undefined for /add-user
    return (
        <Layout page={`${id ? "editUser":"addUser"}`}>
           <UserForm id={id} />
        </Layout>
    );
};

