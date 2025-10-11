import React from 'react'
import useApi from '../../hooks/useApi';
export const ActionModal = ({title, desc, alertModal, user, showModal, setShowModal, handleDelete}) => {
    // Define your state here

    return (
            <div id="deleteModal" className={`modal ${showModal && 'd-flex'}`}>
                <div className="modal-content">
                    <h3>{title}</h3>
                    <p>{desc}</p>
                    <p style={{ "color": "#6c757d", fontSize: "0.875rem" }}>{alertModal}</p>

                    <div className="modal-buttons">
                        <button className="btn-cancel" onClick={()=>setShowModal(false)}>Cancel</button>
                        <button className="btn-confirm" onClick={handleDelete(user?._id)}>Delete User</button>
                    </div>
                </div>
            </div>
        
    )
}
