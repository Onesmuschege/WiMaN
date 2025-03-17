import { useState } from 'react';
import { LineChart, XAxis, YAxis, CartesianGrid, Line, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Users, Wifi, CreditCard, Bell, Settings, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import PropTypes from 'prop-types';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [stats] = useState({
    users: { total: 250, trend: 15 },
    networks: { total: 15, issues: 2 },
    revenue: { total: 125000, trend: 12 },
    devices: { total: 85, trend: 5 }
  });

  const [recentSubscriptions] = useState([
    { id: 1, user: 'John Doe', plan: 'Premium', status: 'active', avatar: '/api/placeholder/32/32' },
    { id: 2, user: 'Jane Smith', plan: 'Basic', status: 'active', avatar: '/api/placeholder/32/32' },
    { id: 3, user: 'Bob Wilson', plan: 'Enterprise', status: 'pending', avatar: '/api/placeholder/32/32' }
  ]);

  const [systemHealth] = useState({
    cpu: 28,
    ram: 45,
    storage: 32,
    networkLoad: 'Normal'
  });

  const revenueData = [
    { month: 'Jan', amount: 85000 },
    { month: 'Feb', amount: 95000 },
    { month: 'Mar', amount: 125000 }
  ];

  return (
    <div className={`min-h-screen p-6 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {currentUser?.username}</h1>
          <p className="text-gray-500">Here is what is happening with your networks</p>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button className="p-2 rounded-full hover:bg-gray-200 relative dark:hover:bg-gray-700">
            <Bell size={20} />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          <button className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
            <Settings size={20} />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Users"
          value={stats.users.total}
          trend={stats.users.trend}
          icon={<Users className="h-6 w-6" />}
          color="bg-blue-500"
        />
        <StatCard
          title="Active Networks"
          value={stats.networks.total}
          subtitle={`${stats.networks.issues} issues`}
          icon={<Wifi className="h-6 w-6" />}
          color="bg-green-500"
        />
        <StatCard
          title="Revenue"
          value={`KES ${stats.revenue.total.toLocaleString()}`}
          trend={stats.revenue.trend}
          icon={<CreditCard className="h-6 w-6" />}
          color="bg-purple-500"
        />
        <StatCard
          title="Connected Devices"
          value={stats.devices.total}
          trend={stats.devices.trend}
          icon={<Activity className="h-6 w-6" />}
          color="bg-orange-500"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6 dark:bg-gray-800">
          <h2 className="text-xl font-semibold mb-4">Revenue Trends</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="amount" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6 dark:bg-gray-800">
          <h2 className="text-xl font-semibold mb-4">Network Status</h2>
          <div className="h-80 flex items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400">Network Map Coming Soon</p>
          </div>
        </div>
      </div>

      {/* Recent Subscriptions & System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 dark:bg-gray-800">
          <h2 className="text-xl font-semibold mb-4">Recent Subscriptions</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="py-2">User</th>
                  <th className="py-2">Plan</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentSubscriptions.map(sub => (
                  <tr key={sub.id}>
                    <td className="py-2 flex items-center gap-2">
                      <img src={sub.avatar} alt="" className="w-8 h-8 rounded-full" />
                      {sub.user}
                    </td>
                    <td className="py-2 text-center">{sub.plan}</td>
                    <td className="py-2 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        sub.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-200' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-200'
                      }`}>
                        {sub.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 dark:bg-gray-800">
          <h2 className="text-xl font-semibold mb-4">System Health</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span>CPU Usage</span>
                <span>{systemHealth.cpu}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                <div 
                  className="bg-blue-500 rounded-full h-2" 
                  style={{ width: `${systemHealth.cpu}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span>RAM Usage</span>
                <span>{systemHealth.ram}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                <div 
                  className="bg-green-500 rounded-full h-2" 
                  style={{ width: `${systemHealth.ram}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span>Storage</span>
                <span>{systemHealth.storage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                <div 
                  className="bg-purple-500 rounded-full h-2" 
                  style={{ width: `${systemHealth.storage}%` }}
                ></div>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Network Load: <span className="text-green-500 font-semibold">{systemHealth.networkLoad}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, trend, icon, color, subtitle }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 transform transition-transform hover:scale-105 dark:bg-gray-800">
      <div className="flex items-center justify-between mb-4">
        <div className={`${color} text-white p-3 rounded-lg`}>
          {icon}
        </div>
        {trend !== undefined && (
          <span className={`text-sm ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <h3 className="text-gray-500 text-sm dark:text-gray-400">{title}</h3>
      <p className="text-2xl font-bold mt-1">{value}</p>
      {subtitle && <p className="text-sm text-gray-500 mt-1 dark:text-gray-400">{subtitle}</p>}
    </div>
  );
};

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  trend: PropTypes.number,
  icon: PropTypes.element.isRequired,
  color: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
};

export default Dashboard;