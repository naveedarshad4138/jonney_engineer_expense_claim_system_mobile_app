import React from 'react';
import { Link } from 'react-router-dom';
// import './sidebar.css';

const Sidebar = ({ logout, user, page }) => {
    return (
        <div className="sidebar">
            <div className="logo">ABML</div>

            <ul className="nav-menu">
                <li className="nav-item">
                    <Link to="/dashboard" className={`nav-link ${page == 'Dashboard' ? 'active' : ''}`}>
                        <i style={{ marginRight: "20px" }} className="material-icons">home</i>
                        Dashboard
                    </Link>
                </li>
                {/*<li className="nav-item">
                     <Link to="/expense-history" className={`nav-link ${page == 'formHistory' ? 'active' : ''}`}>
                        <i style={{ marginRight: "20px" }} className=" material-icons">history</i>
                        All expenses History
                    </Link>
                </li> */}
                
                
               {user?.role=='Admin' && <li className="nav-item">
                    <Link to="/expense-history" className={`nav-link ${page == 'mangeSearches' ? 'active' : ''}`}>
                        <i style={{ marginRight: "20px" }} className=" material-icons">search</i>
                        Manage expenses
                    </Link>
                </li>
            }
            {user?.role=='Admin' && <li className="nav-item">
                    <Link to="/manage-users" className={`nav-link ${page == 'manageUsers' ? 'active' : ''}`}>
                        <i style={{ marginRight: "20px" }} className=" material-icons">person</i>
                        Manage Users
                    </Link>
                </li>
                }
            <li className="nav-item">
                    <Link to="/password-manager" className={`nav-link ${page == 'passwordManager' ? 'active' : ''}`}>
                        <i style={{ marginRight: "20px" }} className=" material-icons">key</i>
                        Password Manager
                    </Link>
                </li>
                <li className="nav-item logout-item">
                    <Link to='/login' className="nav-link" onClick={logout} >
                        <i style={{ marginRight: "20px" }} className=" material-icons">logout</i>
                        Logout
                    </Link>
                </li>
            </ul>

            <div className="user-profile">
                <div className="d-flex align-items-center text-white">
                    <div className="user-avatar"> {
                        user?.username
                            ?.split(' ')
                            .map(word => word.charAt(0).toUpperCase())
                            .join('')
                    }</div>
                    <div className="user-details text-white">
                        <h4>{user?.username}!</h4>
                        <p class='m-0'>{user?.role}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
