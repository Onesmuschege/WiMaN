// src/pages/admin/Users.jsx
import { useState, useEffect } from 'react';
import { adminService } from '../../services/apiService';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  // Check if user is admin, if not redirect to dashboard
  useEffect(() => {
    if (!isAdmin()) {
      navigate('/dashboard');
    }
  }, [isAdmin, navigate]);

  // Fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const result = await adminService.getAllUsers();
        if (result.success) {
          setUsers(result.data);
        } else {
          setError('Failed to load users');
        }
      } catch (err) {
        setError('An error occurred while loading users');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Handle edit user
  const handleEditUser = (user) => {
    setSelectedUser(user);
    setFormData({
      email: user.email,
      password: ''
    });
    setShowEditModal(true);
  };

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Submit user update
  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Only include fields that have values
      const updateData = {};
      if (formData.email) updateData.email = formData.email;
      if (formData.password) updateData.password = formData.password;

      const result = await adminService.updateUser(selectedUser.username, updateData);
      if (result.success) {
        // Update the users list with the updated user
        setUsers(users.map(user => 
          user.username === selectedUser.username 
            ? { ...user, ...updateData } 
            : user
        ));
        setShowEditModal(false);
        setSelectedUser(null);
      } else {
        setError(result.error || 'Failed to update user');
      }
    } catch (err) {
      setError('An error occurred while updating user');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Block user
  const handleBlockUser = async (username) => {
    if (window.confirm(`Are you sure you want to block user ${username}?`)) {
      setLoading(true);
      try {
        const result = await adminService.blockUser(username);
        if (result.success) {
          // Update the users list to reflect the blocked status
          setUsers(users.map(user => 
            user.username === username 
              ? { ...user, status: 'blocked' } 
              : user
          ));
        } else {
          setError(result.error || `Failed to block user ${username}`);
        }
      } catch (err) {
        setError('An error occurred while blocking user');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading && users.length === 0) {
    return <div className="loading-container">Loading users...</div>;
  }

  return (
    <div className="admin-users-container">
      <h1>User Management</h1>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      <div className="user-list-container">
        <div className="users-table-header">
          <h2>All Users</h2>
          <div className="search-filter">
            <input 
              type="text" 
              placeholder="Search users..." 
              className="search-input"
            />
          </div>
        </div>
        
        <table className="users-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.username} className={user.status === 'blocked' ? 'blocked-user' : ''}>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>
                  <span className={`status-badge ${user.status || 'active'}`}>
                    {user.status || 'Active'}
                  </span>
                </td>
                <td className="action-buttons">
                  <button 
                    onClick={() => handleEditUser(user)} 
                    className="btn btn-sm btn-primary"
                  >
                    Edit
                  </button>
                  {user.status !== 'blocked' && (
                    <button 
                      onClick={() => handleBlockUser(user.username)} 
                      className="btn btn-sm btn-danger"
                    >
                      Block
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Edit User Modal */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Edit User: {selectedUser.username}</h3>
              <button 
                onClick={() => setShowEditModal(false)}
                className="modal-close"
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleUpdateUser}>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="password">New Password (leave blank to keep unchanged)</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter new password"
                />
              </div>
              
              <div className="modal-actions">
                <button 
                  type="button" 
                  onClick={() => setShowEditModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Updating...' : 'Update User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;