import React, { useState, useEffect } from 'react';
import { Layout } from '../../Layout/Layout';
import './ManageUsers.css';
import { Alert } from '../../../components/Alert/Alert';
import { ActionModal } from '../../../components/Modals/ActionModal';
import useApi from '../../../hooks/useApi';

import { Link } from 'react-router-dom';

export const ManageUsers = () => {
    const { fetchData, deleteData, status, loading } = useApi();
    const [data, setData] = useState([]);
    const [deleteRecord, setDeleteRecord] = useState([]);
    ////////// Modal states ///////////////
    const [showModal, setShowModal] = useState(false);
    const closeModal = (record) => {
        setShowModal(true);
        setDeleteRecord(record);
    }
    const handleDelete = (id) => async (e) => {
        e.preventDefault();
        await deleteData(`auth/user/${id}`, "Record deleted successfully!", "Failed to delete record!");
        setData({ results: data?.results?.filter(record => record._id !== id) });
        setShowModal(false);
    };
    ////////// Modal states ///////////////

      useEffect(() => {
        const loadData = async () => {
          const results = await fetchData('auth/allusers');
          setData(results);
        };
        loadData();
      }, []);
    return (
        <Layout page="manageUsers" data={data}>
            {status && <Alert data={status} />}

                <div className='manageusers'>
                    {/* <Link to='/add-user'><button className="btn-add-user">
                        <i className="material-icons">person_add</i>
                        Add User
                    </button>
                    </Link> */}
                    {loading && <p>Loading...</p>}
                    {!loading && <div className="users-table">
                        <div className="table-header">
                            <h2>All Users {data?.count}</h2>
                        </div>

                        <div className="table-responsive">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Role</th>
                                        <th>Wallet Value</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data?.results?.map((record, key) => (
                                        <tr key={key}>
                                            <td>
                                                <strong>{record?.username}</strong>
                                            </td>
                                            <td>{record?.email}</td>
                                            <td>
                                                <span className="user-role role-user">
                                                    {record?.role}                                            </span>
                                            </td>
                                            <td>{record?.currentFloat}</td>
                                            <td>
                                                <div className="action-buttons">
                                                    <Link to={`/edit-user/${record._id}`} className="blue-btn">
                                                        <i className="material-icons">edit</i> Edit
                                                    </Link>
                                                    <button className="red-btn" onClick={() => closeModal(record)}>
                                                        <i className="material-icons">delete</i> Delete
                                                    </button>
                                                </div>

                                            </td>

                                        </tr>

                                    ))}

                                    <ActionModal title={'Confirm Delete'} desc={<p>Are you sure you want to delete <strong id="deleteUserName">{deleteRecord?.username}</strong>?</p>} alertText={'his action cannot be undone.'} user={deleteRecord} showModal={showModal} setShowModal={setShowModal} handleDelete={handleDelete} />
                                </tbody>
                            </table>
                        </div>
                    </div>}
                </div>
        </Layout>
    );
};

