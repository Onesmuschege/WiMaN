// src/App.jsx
import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/auth/AdminRoute';
import TestAPI from './TestAPI';

// Layout components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Public pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import NotFound from './pages/NotFound';

// Protected pages
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Subscriptions from './pages/Subscriptions';
import Networks from './pages/Networks';
import NetworkDetails from './pages/NetworkDetails';
import Devices from './pages/Devices';
import DeviceDetails from './pages/DeviceDetails';
import UserSettings from './pages/UserSettings';

// Admin pages
import AdminUsers from './pages/admin/Users';
import AdminSubscriptions from './pages/admin/Subscriptions';
import AdminSettings from './pages/admin/Settings';

// CSS
import './assets/css/index.css';
import 'tailwindcss/tailwind.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Navbar />
          <main className="main-content">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Home />} />
              <Route path="/test" element={<TestAPI />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              
              {/* Protected routes */}
              <Route 
                path="/dashboard" 
                element={<ProtectedRoute><Dashboard /></ProtectedRoute>} 
              />
              <Route 
                path="/profile" 
                element={<ProtectedRoute><Profile /></ProtectedRoute>} 
              />
              <Route 
                path="/subscriptions" 
                element={<ProtectedRoute><Subscriptions /></ProtectedRoute>} 
              />
              <Route 
                path="/networks" 
                element={<ProtectedRoute><Networks /></ProtectedRoute>} 
              />
              <Route 
                path="/networks/:id" 
                element={<ProtectedRoute><NetworkDetails /></ProtectedRoute>} 
              />
              <Route 
                path="/devices" 
                element={<ProtectedRoute><Devices /></ProtectedRoute>} 
              />
              <Route 
                path="/devices/:id" 
                element={<ProtectedRoute><DeviceDetails /></ProtectedRoute>} 
              />
              <Route 
                path="/settings" 
                element={<ProtectedRoute><UserSettings /></ProtectedRoute>} 
              />
              
              {/* Admin routes */}
              <Route 
                path="/admin/users" 
                element={<AdminRoute><AdminUsers /></AdminRoute>} 
              />
              <Route 
                path="/admin/subscriptions" 
                element={<AdminRoute><AdminSubscriptions /></AdminRoute>} 
              />
              <Route 
                path="/admin/settings" 
                element={<AdminRoute><AdminSettings /></AdminRoute>} 
              />
              
              {/* 404 route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;