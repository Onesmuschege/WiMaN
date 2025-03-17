import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Wifi, Laptop, Shield, BarChart } from 'lucide-react';

const Home = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <div className="home-container text-center">
      {/* Hero Section */}
      <section className="hero-section bg-blue-600 text-white py-20 px-6">
        <div className="max-w-4xl mx-auto animate-fade-in">
          <h1 className="text-5xl font-bold mb-6">Welcome to WIMAN</h1>
          <p className="text-lg leading-relaxed mb-8">
            Wireless Management System - Your complete solution for managing WiFi networks and connected devices.
          </p>
          <div className="flex justify-center gap-4">
            {isAuthenticated ? (
              <Link to="/dashboard" className="bg-white text-blue-600 px-6 py-3 rounded-lg hover:bg-gray-200 transition shadow-md">
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="bg-white text-blue-600 px-6 py-3 rounded-lg hover:bg-gray-200 transition shadow-md">
                  Login
                </Link>
                <Link to="/register" className="border border-white text-white px-6 py-3 rounded-lg hover:bg-white hover:text-blue-600 transition shadow-md">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section py-16 px-6 bg-gray-50">
        <h2 className="text-3xl font-semibold mb-8">Key Features</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[{ icon: Wifi, title: 'Network Management', desc: 'Monitor and manage all your wireless networks from a single dashboard.' },
            { icon: Laptop, title: 'Device Tracking', desc: 'Track all connected devices, monitor history, and block suspicious devices.' },
            { icon: Shield, title: 'Security Features', desc: 'Advanced security tools like intrusion detection and access controls.' },
            { icon: BarChart, title: 'Analytics & Reporting', desc: 'Get insights with real-time analytics and generate reports.' }
          ].map((feature, index) => (
            <div key={index} className="feature-card bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition">
              <feature.icon className="text-blue-600 text-4xl mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Subscription Section */}
      <section className="pricing-section py-16 px-6 bg-white">
        <h2 className="text-3xl font-semibold mb-4">Subscription Plans</h2>
        <p className="text-gray-600 mb-6">Choose a plan that suits your needs</p>
        <Link to="/subscriptions" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition shadow-md">
          View Available Plans
        </Link>
      </section>

      {/* Call-To-Action Section */}
      <section className="cta-section py-16 px-6 bg-blue-600 text-white text-center">
        <h2 className="text-3xl font-semibold mb-4">Ready to take control of your wireless networks?</h2>
        <p className="text-lg mb-6">Join thousands of users who trust WIMAN for their wireless management needs.</p>
        <Link to="/register" className="bg-white text-blue-600 px-6 py-3 rounded-lg hover:bg-gray-200 transition shadow-md">
          Sign Up Now
        </Link>
      </section>
    </div>
  );
};

export default Home;
