// src/pages/NetworkDetails.jsx
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';

const NetworkDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [network, setNetwork] = useState(null);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [editing, setEditing] = useState(false);
  const [networkForm, setNetworkForm] = useState({
    name: '',
    type: '',
    description: '',
    status: ''
  });

  // Mock network data
  const mockNetwork = {
    id: 1,
    name: 'Main Office Network',
    type: 'wifi',
    description: 'Primary network for the main office staff',
    status: 'active',
    ipRange: '192.168.1.0/24',
    gatewayIp: '192.168.1.1',
    dnsServers: ['8.8.8.8', '8.8.4.4'],
    createdAt: '2023-05-15',
    bandwidth: {
      upload: 100,
      download: 500,
      unit: 'Mbps'
    },
    security: {
      encryption: 'WPA2',
      password: true,
      macFiltering: true
    }
  };

  // Mock devices data
  const mockDevices = [
    {
      id: 1,
      name: 'Office Laptop',
      macAddress: '00:1A:2B:3C:4D:5E',
      ipAddress: '192.168.1.101',
      status: 'online',
      lastSeen: '2023-09-15T14:30:25',
      type: 'laptop'
    },
    {
      id: 2,
      name: 'Reception Printer',
      macAddress: '00:1A:2B:3C:4D:6F',
      ipAddress: '192.168.1.102',
      status: 'online',
      lastSeen: '2023-09-15T15:20:10',
      type: 'printer'
    }
  ];

  // Fetch network and connected devices
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // In a real app, you would fetch data from your API
        setTimeout(() => {
          // Check if network exists in our mock data
          if (mockNetwork.id.toString() === id) {
            setNetwork(mockNetwork);
            setNetworkForm({
              name: mockNetwork.name,
              type: mockNetwork.type,
              description: mockNetwork.description || '',
              status: mockNetwork.status
            });
            setDevices(mockDevices);
          } else {
            setError('Network not found');
          }
          setLoading(false);
        }, 1000);
      } catch (err) {
        setError('Failed to fetch network details');
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Format last seen time for devices
  const formatLastSeen = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Handle input change for network form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNetworkForm({
      ...networkForm,
      [name]: value
    });
  };

  // Toggle editing mode
  const toggleEditing = () => {
    if (editing) {
      // Reset form to original values if canceling
      setNetworkForm({
        name: network.name,
        type: network.type,
        description: network.description || '',
        status: network.status
      });
    }
    setEditing(!editing);
  };

  // Save network changes
  const handleSaveNetwork = (e) => {
    e.preventDefault();
    
    // In a real app, you would send updates to your API
    setNetwork({
      ...network,
      name: networkForm.name,
      type: networkForm.type,
      description: networkForm.description,
      status: networkForm.status
    });
    
    setEditing(false);
  };

  // Delete network
  const handleDeleteNetwork = () => {
    if (window.confirm('Are you sure you want to delete this network? This action cannot be undone.')) {
      // In a real app, you would send a delete request to your API
      navigate('/networks');
    }
  };

  if (loading) {
    return <div className="loading-container">Loading network details...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="alert alert-danger">{error}</div>
        <Link to="/networks" className="btn btn-primary">
          Back to Networks
        </Link>
      </div>
    );
  }

  if (!network) {
    return (
      <div className="not-found-container">
        <h2>Network Not Found</h2>
        <p>The network you are looking for does not exist or has been removed.</p>
        <Link to="/networks" className="btn btn-primary">
          Back to Networks
        </Link>
      </div>
    );
  }

  return (
    <div className="network-details-container">
      <div className="page-header">
        <div className="breadcrumbs">
          <Link to="/networks">Networks</Link> / {network.name}
        </div>
        <div className="actions">
          {!editing ? (
            <>
              <button 
                onClick={toggleEditing} 
                className="btn btn-primary"
              >
                Edit Network
              </button>
              <button 
                onClick={handleDeleteNetwork} 
                className="btn btn-danger"
              >
                Delete
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={handleSaveNetwork} 
                className="btn btn-success"
              >
                Save
              </button>
              <button 
                onClick={toggleEditing} 
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>

      <div className="network-header">
        {editing ? (
          <form onSubmit={handleSaveNetwork}>
            <div className="form-group">
              <label htmlFor="name">Network Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={networkForm.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="type">Type</label>
                <select
                  id="type"
                  name="type"
                  value={networkForm.type}
                  onChange={handleInputChange}
                  required
                >
                  <option value="wifi">Wi-Fi</option>
                  <option value="ethernet">Ethernet</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="status">Status</label>
                <select
                  id="status"
                  name="status"
                  value={networkForm.status}
                  onChange={handleInputChange}
                  required
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={networkForm.description}
                onChange={handleInputChange}
                rows="3"
              />
            </div>
          </form>
        ) : (
          <>
            <h1>{network.name}</h1>
            <div className="network-meta">
              <span className={`status-badge ${network.status}`}>
                {network.status === 'active' ? 'Active' : 'Inactive'}
              </span>
              <span className="network-type">
                {network.type === 'wifi' ? 'Wi-Fi' : 'Ethernet'}
              </span>
              <span className="creation-date">
                Created on {formatDate(network.createdAt)}
              </span>
            </div>
            {network.description && (
              <p className="network-description">{network.description}</p>
            )}
          </>
        )}
      </div>

      <div className="network-tabs">
        <ul className="tabs-nav">
          <li 
            className={activeTab === 'overview' ? 'active' : ''}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </li>
          <li 
            className={activeTab === 'devices' ? 'active' : ''}
            onClick={() => setActiveTab('devices')}
          >
            Connected Devices ({devices.length})
          </li>
          <li 
            className={activeTab === 'settings' ? 'active' : ''}
            onClick={() => setActiveTab('settings')}
          >
            Network Settings
          </li>
          <li 
            className={activeTab === 'statistics' ? 'active' : ''}
            onClick={() => setActiveTab('statistics')}
          >
            Statistics
          </li>
        </ul>

        <div className="tab-content">
          {activeTab === 'overview' && (
            <div className="overview-tab">
              <div className="info-grid">
                <div className="info-card">
                  <h3>IP Configuration</h3>
                  <ul className="info-list">
                    <li>
                      <span className="info-label">IP Range:</span>
                      <span className="info-value">{network.ipRange}</span>
                    </li>
                    <li>
                      <span className="info-label">Gateway IP:</span>
                      <span className="info-value">{network.gatewayIp}</span>
                    </li>
                    <li>
                      <span className="info-label">DNS Servers:</span>
                      <span className="info-value">{network.dnsServers.join(', ')}</span>
                    </li>
                  </ul>
                </div>
                
                <div className="info-card">
                  <h3>Bandwidth</h3>
                  <ul className="info-list">
                    <li>
                      <span className="info-label">Download:</span>
                      <span className="info-value">{network.bandwidth.download} {network.bandwidth.unit}</span>
                    </li>
                    <li>
                      <span className="info-label">Upload:</span>
                      <span className="info-value">{network.bandwidth.upload} {network.bandwidth.unit}</span>
                    </li>
                  </ul>
                </div>
                
                <div className="info-card">
                  <h3>Security</h3>
                  <ul className="info-list">
                    <li>
                      <span className="info-label">Encryption:</span>
                      <span className="info-value">{network.security.encryption}</span>
                    </li>
                    <li>
                      <span className="info-label">Password Protected:</span>
                      <span className="info-value">{network.security.password ? 'Yes' : 'No'}</span>
                    </li>
                    <li>
                      <span className="info-label">MAC Filtering:</span>
                      <span className="info-value">{network.security.macFiltering ? 'Enabled' : 'Disabled'}</span>
                    </li>
                  </ul>
                </div>
                
                <div className="info-card">
                  <h3>Connected Devices</h3>
                  <div className="device-summary">
                    <div className="device-count">
                      <span className="count">{devices.length}</span>
                      <span className="label">Total Devices</span>
                    </div>
                    <div className="device-count">
                      <span className="count">{devices.filter(d => d.status === 'online').length}</span>
                      <span className="label">Online</span>
                    </div>
                    <div className="device-count">
                      <span className="count">{devices.filter(d => d.status !== 'online').length}</span>
                      <span className="label">Offline</span>
                    </div>
                  </div>
                  <Link to="#" onClick={() => setActiveTab('devices')} className="btn btn-sm btn-outline">
                    View All Devices
                  </Link>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'devices' && (
            <div className="devices-tab">
              <div className="devices-header">
                <h3>Connected Devices</h3>
                <Link to="/devices/new" className="btn btn-primary">Add Device</Link>
              </div>

              {devices.length === 0 ? (
                <div className="no-data">
                  No devices are connected to this network.
                </div>
              ) : (
                <table className="devices-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>MAC Address</th>
                      <th>IP Address</th>
                      <th>Status</th>
                      <th>Last Seen</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {devices.map(device => (
                      <tr key={device.id}>
                        <td>
                          <Link to={`/devices/${device.id}`} className="device-name">
                            {device.name}
                          </Link>
                        </td>
                        <td>{device.macAddress}</td>
                        <td>{device.ipAddress}</td>
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
                            <button className="btn btn-sm btn-danger">
                              Block
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="settings-tab">
              <h3>Network Settings</h3>
              <div className="settings-form">
                <div className="form-group">
                  <label>IP Range</label>
                  <input 
                    type="text" 
                    value={network.ipRange} 
                    disabled 
                    className="form-control-disabled"
                  />
                </div>
                <div className="form-group">
                  <label>Gateway IP</label>
                  <input 
                    type="text" 
                    value={network.gatewayIp} 
                    disabled 
                    className="form-control-disabled"
                  />
                </div>
                <div className="form-group">
                  <label>DNS Servers</label>
                  <input 
                    type="text" 
                    value={network.dnsServers.join(', ')} 
                    disabled 
                    className="form-control-disabled"
                  />
                </div>
                <div className="form-group">
                  <label>Encryption</label>
                  <select className="form-control">
                    <option>{network.security.encryption}</option>
                    <option>WPA3</option>
                    <option>WPA</option>
                    <option>None</option>
                  </select>
                </div>
                <div className="form-check">
                  <input 
                    type="checkbox" 
                    id="macFiltering" 
                    checked={network.security.macFiltering} 
                    className="form-check-input"
                  />
                  <label htmlFor="macFiltering" className="form-check-label">
                    Enable MAC Address Filtering
                  </label>
                </div>
                <button className="btn btn-primary">Save Network Settings</button>
              </div>
            </div>
          )}

          {activeTab === 'statistics' && (
            <div className="statistics-tab">
              <h3>Network Statistics</h3>
              <div className="statistics-placeholder">
                <p>Network usage statistics will be displayed here.</p>
                <p>Feature coming soon!</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NetworkDetails;