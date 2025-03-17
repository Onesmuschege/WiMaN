import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white py-10">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand Section */}
        <div>
          <h3 className="text-2xl font-semibold">WIMAN</h3>
          <p className="text-sm mt-2">Wireless Management System</p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-lg font-semibold mb-3">Quick Links</h4>
          <ul className="space-y-2">
            <li><Link to="/" className="hover:text-blue-400">Home</Link></li>
            <li><Link to="/dashboard" className="hover:text-blue-400">Dashboard</Link></li>
            <li><Link to="/subscriptions" className="hover:text-blue-400">Subscriptions</Link></li>
            <li><Link to="/networks" className="hover:text-blue-400">Networks</Link></li>
            <li><Link to="/devices" className="hover:text-blue-400">Devices</Link></li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h4 className="text-lg font-semibold mb-3">Support</h4>
          <ul className="space-y-2">
            <li><Link to="/faq" className="hover:text-blue-400">FAQ</Link></li>
            <li><Link to="/contact" className="hover:text-blue-400">Contact Us</Link></li>
            <li><Link to="/help" className="hover:text-blue-400">Help Center</Link></li>
          </ul>
        </div>

        {/* Legal & Social Media */}
        <div>
          <h4 className="text-lg font-semibold mb-3">Legal</h4>
          <ul className="space-y-2">
            <li><Link to="/terms" className="hover:text-blue-400">Terms of Service</Link></li>
            <li><Link to="/privacy" className="hover:text-blue-400">Privacy Policy</Link></li>
          </ul>
          
          <h4 className="text-lg font-semibold mt-5">Follow Us</h4>
          <div className="flex space-x-4 mt-3">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="hover:text-blue-500">
              <i className="fab fa-facebook text-xl"></i>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="hover:text-blue-400">
              <i className="fab fa-twitter text-xl"></i>
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="hover:text-blue-600">
              <i className="fab fa-linkedin text-xl"></i>
            </a>
          </div>
        </div>
      </div>

      {/* Footer Bottom Section */}
      <div className="border-t border-gray-700 mt-10 text-center py-4">
        <p className="text-sm">© {currentYear} WIMAN. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
