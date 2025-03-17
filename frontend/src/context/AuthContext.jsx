// src/context/AuthContext.jsx
import { createContext, useState, useEffect, useContext } from 'react';
import authService from '../services/authService';

// Create the auth context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

// Provider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // On initial load, check if user is already logged in
  useEffect(() => {
    const user = authService.getCurrentUser();
    const authenticated = authService.isAuthenticated();
    const role = localStorage.getItem('userRole');
    
    if (user && authenticated) {
      setCurrentUser(user);
      setUserRole(role);
      setIsAuthenticated(true);
    }
    
    setLoading(false);
  }, []);

  // Login function
  const login = async (credentials) => {
    setError(null);
    try {
      setLoading(true);
      const result = await authService.login(credentials);
      
      if (result.success) {
        const user = authService.getCurrentUser();
        const role = localStorage.getItem('userRole');
        
        setCurrentUser(user);
        setUserRole(role);
        setIsAuthenticated(true);
        return { success: true };
      } else {
        setError(result.error || 'Login failed');
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMessage = err.message || 'An error occurred during login';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (userData) => {
    setError(null);
    try {
      setLoading(true);
      const result = await authService.register(userData);
      
      if (result.success) {
        return { success: true };
      } else {
        setError(result.error || 'Registration failed');
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMessage = err.message || 'An error occurred during registration';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    authService.logout();
    setCurrentUser(null);
    setUserRole(null);
    setIsAuthenticated(false);
  };

  // Check if user is admin
  const isAdmin = () => {
    return userRole === 'admin';
  };

  // Context value
  const value = {
    currentUser,
    userRole,
    loading,
    error,
    isAuthenticated,
    login,
    register,
    logout,
    isAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;