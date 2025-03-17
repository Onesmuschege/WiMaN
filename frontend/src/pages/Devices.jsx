// src/pages/Devices.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Devices = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [networkFilter, setNetworkFilter] = useState('all');
  const [networks, setNetworks] = useState([]);

  // Mock devices data
  const mockDevices = [
    {
      id: 1,
      name: 'Office Laptop',
      macAddress: '00:1A:2B:3C:4D:5E',
      ipAddress: '192.168.1.101',
      networkId: 1,
      networkName: 'Main Office Network',
      status: 'online',
      lastSeen: '2023-09-15T14:30:25',
      type: 'laptop'
    },
    {
      id: 2,
      name: 'Reception Printer',
      macAddress: '00:1A:2B:3C:4D:6F',
      ipAddress: '192.168.1.102',
      networkId: 1,
      networkName: 'Main Office Network',
      status: 'online',
      lastSeen: '2023-09-15T15:20:10',
      type: 'printer'
    },
    {
      id: 3,
      name: 'Meeting Room TV',
      macAddress: '00:1A:2B:3C:4D:7G',
      ipAddress: '192.168.1.103',
      networkId: 3,
      networkName: 'IoT Network',
      status: 'offline',
      lastSeen: '2023-09-14T09:45:30',
      type: 'tv'
    },
    {
      id: 4,
      name: 'Guest Phone',
      macAddress: '00:1A:2B:3C:4D:8H',
      ipAddress: '192.168.1.104',
      networkId: 2,
      networkName: 'Guest Network',
      status: 'online',
      lastSeen: '2023-09-15T16:05:45',
      type: 'phone'
    },
    {
      id: 5,
      name: 'Smart Thermostat',
      macAddress: '00:1A:2B:3C:4D:9I',
      ipAddress: '192.168.1.105',
      networkId: 3,
      networkName: 'IoT Network',
      status: 'online',
      lastSeen: '2023-09-15T15:50:20',
      type: 'thermostat'
    }
  ];

  // Mock networks data
  const mockNetworks = [
    { id: 1, name: 'Main Office Network' },
    { id: 2, name: 'Guest Network' },
    { id: 3, name: 'IoT Network' }
  ];

  // Simulate API call to fetch devices and networks
  useEffect(() => {
    // In a real app, you would fetch data from your API
    const fetchData = async () => {
      setLoading(true);
      try {
        // Simulating API delay
        setTimeout(() => {
          setDevices(mockDevices);
          setNetworks(mockNetworks);
          setLoading(false);
        }, 1000);
      } catch (err) {
        setError('Failed to fetch devices');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Format the last seen date
  const formatLastSeen = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Apply filters to devices
  const filteredDevices = devices.filter(device => {
    // Apply search term filter
    const matchesSearch = device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         device.macAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         device.ipAddress.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Apply status filter
    const matchesStatus = statusFilter === 'all' || device.status === statusFilter;
    
    // Apply network filter
    const matchesNetwork = networkFilter === 'all' || device.networkId.toString() === networkFilter;
    
    return matchesSearch && matchesStatus && matchesNetwork;
  });

  // Handle blocking a device
  const handleBlockDevice = (deviceId) => {
    // In a real app, you would call an API to block the device
    setDevices(devices.map(device => 
      device.id === deviceId 
        ? { ...device, status: 'blocked' } 
        : device
    ));
  };

  if (loading) {
    return <div className="loading-container">Loading devices...</div>;
  }

  return (
    <div className="devices-container">
      <div className="page-header">
        <h1>Devices</h1>
        <Link to="/devices/new" className="btn btn-primary">
          Add Device
        </Link>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="devices-controls">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search devices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filters">
          <div className="filter-group">
            <label htmlFor="statusFilter">Status:</label>
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All</option>
              <option value="online">Online</option>
              <option value="offline">Offline</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label htmlFor="networkFilter">Network:</label>
            <select
              id="networkFilter"
              value={networkFilter}
              onChange={(e) => setNetworkFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Networks</option>
              {networks.map(network => (
                <option key={network.id} value={network.id.toString()}>
                  {network.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {filteredDevices.length === 0 ? (
        <div className="no-data">
          {searchTerm || statusFilter !== 'all' || networkFilter !== 'all' ? (
            <p>No devices match your search criteria.</p>
          ) : (
            <p>No devices found. Add your first device to get started.</p>
          )}
        </div>
      ) : (
        <div className="devices-grid">
          <table className="devices-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>MAC Address</th>
                <th>IP Address</th>
                <th>Network</th>
                <th>Status</th>
                <th>Last Seen</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDevices.map(device => (
                <tr key={device.id} className={device.status === 'blocked' ? 'blocked-row' : ''}>
                  <td>
                    <Link to={`/devices/${device.id}`} className="device-name">
                      {device.name}
                    </Link>
                  </td>
                  <td>{device.macAddress}</td>
                  <td>{device.ipAddress}</td>
                  <td>{device.networkName}</td>
                  <td>
                    <span className={`status-badge ${device.status}`}>
                      {device.status.charAt(0).toUpperCase() + device.status.slice(1)}
                    </span>
                  </td>
                  <td>{formatLastSeen(device.lastSeen)}</td>
                  <td>
                    <div className="action-buttons">
                      <Link 
                        to={`/devices/${device.id}`} 
                        className="btn btn-sm btn-primary"
                      >
                        View
                      </Link>
                      {device.status !== 'blocked' ? (
                        <button 
                          className="btn btn-sm btn-danger"
                          onClick={() => handleBlockDevice(device.id)}
                        >
                          Block
                        </button>
                      ) : (
                        <button className="btn btn-sm btn-success">
                          Unblock
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Devices;