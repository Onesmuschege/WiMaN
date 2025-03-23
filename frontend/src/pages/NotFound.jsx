// src/pages/NotFound.jsx
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NotFound = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <h1 className="not-found-title">404</h1>
        <h2>Page Not Found</h2>
        <p>
          The page you are looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="not-found-actions">
          {isAuthenticated ? (
            <Link to="/dashboard" className="btn btn-primary">
              Back to Dashboard
            </Link>
          ) : (
            <Link to="/" className="btn btn-primary">
              Back to Home
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotFound;