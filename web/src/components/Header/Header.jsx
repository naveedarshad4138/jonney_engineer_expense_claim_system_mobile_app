import React from 'react';
import { Link } from 'react-router-dom';

const Header = ({ page, user }) => {
  return (
    <div className="header">
      <div className="welcome-section">
        {page == 'Dashboard' && (
          <>
            <h1>Welcome back!, {user?.username} 👋</h1>
            <p>Ready to unlock your business potential? Let's get started with your business analysis.</p>
          </>
        )}
        {page == 'mangeSearches' && <h1>All Expenses</h1>}
        {page == 'passwordManager' && <h1>Reset Password</h1>}
        {page == 'manageUsers' && (
          <>
            <h1>Manage Users</h1>
            <p>You can view, edit, and manage all registered users here!</p>
          </>
        )
        }
        {page == 'addUser' && (
          <>
            <h1>Add User</h1>
            <p>Add new users to the system here!</p>
          </>
        )
        }
        {page == 'editUser' && (
          <>
            <h1>Edit User</h1>
            <p>Edit existing user information</p>
          </>
        )
        }
        {page == 'singleexpense' && (
          <>
          <Link className="backBtn text-black" to={'/expense-history'}>
        &larr; Back
      </Link>
            <h1>Expense Claim Details</h1>
          </>
        )
        }

      </div>
      <div className="header-actions">
        <button className="btn btn-secondary" onClick={() => window.location.href = '/logout'}>Logout</button>
      </div>
    </div>
  );
};

export default Header;
