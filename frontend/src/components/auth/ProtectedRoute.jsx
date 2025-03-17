// src/components/auth/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Component to protect routes that require authentication
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div className="loading-container">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    // Redirect to login if user is not authenticated
    return <Navigate to="/login" />;
  }
  
  return children;
};

export default ProtectedRoute;

