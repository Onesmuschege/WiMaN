// src/pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/apiService';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { currentUser, isAdmin } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Fetch user profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const result = await userService.getProfile();
        if (result.success) {
          setProfile(result.data);
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

  if (loading) {
    return <div className="loading-container">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard-container">
      <h1>Dashboard</h1>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      <div className="dashboard-welcome">
        <h2>Welcome, {currentUser?.username}!</h2>
        <p>Manage your wireless networks and devices from this dashboard.</p>
      </div>
      
      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Account Status</h3>
          <p className="stat-value">{profile?.status || 'Loading...'}</p>
        </div>
        
        <div className="stat-card">
          <h3>Subscription</h3>
          <p className="stat-value">
            {profile?.subscription ? profile.subscription : 'Not Subscribed'}
          </p>
          {!profile?.subscription && (
            <Link to="/subscriptions" className="btn btn-sm btn-primary">
              Get Subscription
            </Link>
          )}
        </div>
        
        <div className="stat-card">
          <h3>Networks</h3>
          <p className="stat-value">0</p>
          <Link to="/networks" className="btn btn-sm btn-primary">
            Manage Networks
          </Link>
        </div>
        
        <div className="stat-card">
          <h3>Devices</h3>
          <p className="stat-value">0</p>
          <Link to="/devices" className="btn btn-sm btn-primary">
            Manage Devices
          </Link>
        </div>
      </div>
      
      {isAdmin() && (
        <div className="admin-panel">
          <h2>Admin Panel</h2>
          <div className="admin-actions">
            <Link to="/admin/users" className="btn btn-secondary">
              Manage Users
            </Link>
            <Link to="/admin/subscriptions" className="btn btn-secondary">
              View Subscriptions
            </Link>
            <Link to="/admin/settings" className="btn btn-secondary">
              System Settings
            </Link>
          </div>
        </div>
      )}
      
      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="action-buttons">
          <Link to="/profile" className="btn btn-outline">
            Edit Profile
          </Link>
          <Link to="/subscriptions" className="btn btn-outline">
            Subscription Plans
          </Link>
          <Link to="/networks/new" className="btn btn-outline">
            Add Network
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;