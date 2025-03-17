// src/pages/admin/Subscriptions.jsx
import { useState, useEffect } from 'react';
import { adminService } from '../../services/apiService';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingExpired, setProcessingExpired] = useState(false);
  const [processMessage, setProcessMessage] = useState('');

  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  // Check if user is admin, if not redirect to dashboard
  useEffect(() => {
    if (!isAdmin()) {
      navigate('/dashboard');
    }
  }, [isAdmin, navigate]);

  // Fetch all active subscriptions
  useEffect(() => {
    const fetchSubscriptions = async () => {
      setLoading(true);
      try {
        const result = await adminService.getActiveSubscriptions();
        if (result.success) {
          setSubscriptions(result.data);
        } else {
          setError('Failed to load subscriptions');
        }
      } catch (err) {
        setError('An error occurred while loading subscriptions');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptions();
  }, []);

  // Handle processing expired subscriptions
  const handleProcessExpired = async () => {
    setProcessingExpired(true);
    setProcessMessage('');
    try {
      const result = await adminService.processExpiredSubscriptions();
      if (result.success) {
        setProcessMessage('Expired subscriptions processed successfully');
        // Refresh the subscriptions list
        const refreshResult = await adminService.getActiveSubscriptions();
        if (refreshResult.success) {
          setSubscriptions(refreshResult.data);
        }
      } else {
        setError(result.error || 'Failed to process expired subscriptions');
      }
    } catch (err) {
      setError('An error occurred while processing expired subscriptions');
      console.error(err);
    } finally {
      setProcessingExpired(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading && subscriptions.length === 0) {
    return <div className="loading-container">Loading subscriptions...</div>;
  }

  return (
    <div className="admin-subscriptions-container">
      <h1>Subscription Management</h1>
      
      {error && <div className="alert alert-danger">{error}</div>}
      {processMessage && <div className="alert alert-success">{processMessage}</div>}
      
      <div className="admin-actions">
        <button 
          onClick={handleProcessExpired} 
          className="btn btn-primary"
          disabled={processingExpired}
        >
          {processingExpired ? 'Processing...' : 'Process Expired Subscriptions'}
        </button>
      </div>
      
      <div className="subscription-list-container">
        <h2>Active Subscriptions</h2>
        
        {subscriptions.length === 0 ? (
          <div className="no-data">No active subscriptions found</div>
        ) : (
          <table className="subscriptions-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Plan</th>
                <th>Start Date</th>
                <th>Expiry Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.map((subscription, index) => (
                <tr key={index}>
                  <td>{subscription.username}</td>
                  <td>{subscription.plan}</td>
                  <td>{subscription.start_date ? formatDate(subscription.start_date) : 'N/A'}</td>
                  <td>{formatDate(subscription.expires_at)}</td>
                  <td>
                    <span className="status-badge active">Active</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      
      <div className="subscription-stats">
        <div className="stat-card">
          <h3>Total Active Subscriptions</h3>
          <p className="stat-value">{subscriptions.length}</p>
        </div>
        
        <div className="stat-card">
          <h3>Expiring Soon (7 days)</h3>
          <p className="stat-value">
            {subscriptions.filter(sub => {
              const expiryDate = new Date(sub.expires_at);
              const now = new Date();
              const diffDays = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
              return diffDays <= 7 && diffDays > 0;
            }).length}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminSubscriptions;