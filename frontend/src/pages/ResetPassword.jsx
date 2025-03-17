// src/pages/ResetPassword.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import authService from '../services/authService';

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const navigate = useNavigate();
  const location = useLocation();

  // Extract token from URL query params
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get('token');
    
    if (token) {
      setResetToken(token);
    } else {
      setError('Invalid or missing reset token. Please request a new password reset link.');
    }
  }, [location]);

  const validatePasswords = () => {
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validatePasswords()) {
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await authService.resetPassword(resetToken, newPassword);
      
      if (result.success) {
        setSuccess('Your password has been reset successfully');
        // Redirect to login page after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(result.error || 'Failed to reset password. The token might be expired or invalid.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Reset Password</h2>
        
        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        
        {!resetToken ? (
          <div className="auth-links">
            <p>
              <Link to="/forgot-password">Request a new password reset link</Link>
            </p>
          </div>
        ) : (
          <>
            <p className="auth-info">
              Please enter your new password.
            </p>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={loading || success}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading || success}
                  required
                />
              </div>
              
              <div className="form-group">
                <button 
                  type="submit" 
                  className="btn btn-primary w-100"
                  disabled={loading || success}
                >
                  {loading ? 'Resetting Password...' : 'Reset Password'}
                </button>
              </div>
            </form>
          </>
        )}
        
        <div className="auth-links">
          <p>
            Remember your password? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;