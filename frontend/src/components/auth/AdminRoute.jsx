// src/components/auth/AdminRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Component to protect routes that require admin privileges
const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  
  if (loading) {
    return <div className="loading-container">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    // Redirect to login if user is not authenticated
    return <Navigate to="/login" />;
  }
  
  if (!isAdmin()) {
    // Redirect to dashboard if user is not an admin
    return <Navigate to="/dashboard" />;
  }
  
  return children;
};

export default AdminRoute;