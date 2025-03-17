// src/pages/Profile.jsx
import { useState, useEffect } from 'react';
import { userService } from '../services/apiService';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editMode, setEditMode] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
  });
  
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const result = await userService.getProfile();
        if (result.success) {
          setProfile(result.data);
          setFormData({
            email: result.data.email
          });
        } else {
          setError('Failed to load profile data');
        }
      } catch (err) {
        setError('An error occurred while loading profile data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle password input change
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Toggle edit mode
  const toggleEditMode = () => {
    setEditMode(!editMode);
    setError('');
    setSuccess('');
  };

  // Update profile information
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // In a real implementation, you would call an API to update the user profile
      // For now, we'll simulate a successful update
      setTimeout(() => {
        setProfile(prev => ({
          ...prev,
          email: formData.email
        }));
        setEditMode(false);
        setSuccess('Profile updated successfully');
        setLoading(false);
      }, 1000);
    } catch (err) {
      setError('An error occurred while updating profile');
      console.error(err);
      setLoading(false);
    }
  };

  // Change password
  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate password
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      const result = await userService.changePassword(
        passwordData.oldPassword,
        passwordData.newPassword
      );
      
      if (result.success) {
        setSuccess('Password changed successfully');
        setPasswordData({
          oldPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        setError(result.error || 'Failed to change password');
      }
    } catch (err) {
      setError('An error occurred while changing password');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profile) {
    return <div className="loading-container">Loading profile...</div>;
  }

  return (
    <div className="profile-container">
      <h1>User Profile</h1>
      
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            {currentUser?.username.charAt(0).toUpperCase()}
          </div>
          <div className="profile-info">
            <h2>{currentUser?.username}</h2>
            <p>{profile?.status === 'active' ? (
              <span className="status-badge active">Active</span>
            ) : (
              <span className="status-badge inactive">{profile?.status}</span>
            )}</p>
          </div>
        </div>
        
        <div className="profile-body">
          {!editMode ? (
            <div className="profile-details">
              <div className="detail-item">
                <span className="detail-label">Username:</span>
                <span className="detail-value">{currentUser?.username}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Email:</span>
                <span className="detail-value">{profile?.email}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Account Status:</span>
                <span className="detail-value">{profile?.status || 'Active'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Role:</span>
                <span className="detail-value">{currentUser?.role || 'User'}</span>
              </div>
              
              <button 
                onClick={toggleEditMode} 
                className="btn btn-primary"
                disabled={loading}
              >
                Edit Profile
              </button>
            </div>
          ) : (
            <form onSubmit={handleProfileUpdate} className="edit-profile-form">
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={currentUser?.username}
                  disabled
                  className="form-control-disabled"
                />
                <small>Username cannot be changed</small>
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-actions">
                <button 
                  type="button" 
                  onClick={toggleEditMode}
                  className="btn btn-secondary"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
      
      <div className="profile-card">
        <h3>Change Password</h3>
        <form onSubmit={handlePasswordUpdate} className="change-password-form">
          <div className="form-group">
            <label htmlFor="oldPassword">Current Password</label>
            <input
              type="password"
              id="oldPassword"
              name="oldPassword"
              value={passwordData.oldPassword}
              onChange={handlePasswordChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="newPassword">New Password</label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Changing Password...' : 'Change Password'}
          </button>
        </form>
      </div>
      
      <div className="profile-card">
        <h3>Subscription Information</h3>
        {profile?.subscription ? (
          <div className="subscription-info">
            <div className="detail-item">
              <span className="detail-label">Current Plan:</span>
              <span className="detail-value">{profile.subscription.plan}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Status:</span>
              <span className="detail-value">
                <span className="status-badge active">Active</span>
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Expires On:</span>
              <span className="detail-value">{new Date(profile.subscription.expiresAt).toLocaleDateString()}</span>
            </div>
            
            <button className="btn btn-primary">
              Manage Subscription
            </button>
          </div>
        ) : (
          <div className="no-subscription">
            <p>You don&apos;t have an active subscription plan.</p>
            <button className="btn btn-primary">
              Get Subscription
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;