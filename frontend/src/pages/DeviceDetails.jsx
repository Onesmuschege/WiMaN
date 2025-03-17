// src/pages/DeviceDetails.jsx
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
// import { deviceService } from '../services/apiService';

const mockDevice = {
  id: 1,
  name: 'Device 1',
  type: 'laptop',
  description: 'A sample device',
  macAddress: '00:1B:44:11:3A:B7',
  ipAddress: '192.168.1.2',
  networkId: 1,
  networkName: 'Main Office Network',
  status: 'online',
  firstSeen: '2023-01-01T12:00:00Z',
  lastSeen: '2023-01-02T12:00:00Z',
  manufacturer: 'Sample Manufacturer',
  model: 'Sample Model',
  os: 'Sample OS',
  bandwidth: {
    today: { download: 500, upload: 100, unit: 'MB' },
    week: { download: 3500, upload: 700, unit: 'MB' },
    month: { download: 15000, upload: 3000, unit: 'MB' }
  },
  activity: [
    { timestamp: '2023-01-01T12:00:00Z', action: 'Connected', details: 'Device connected to the network' },
    { timestamp: '2023-01-02T12:00:00Z', action: 'Disconnected', details: 'Device disconnected from the network' }
  ]
};

const DeviceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [device, setDevice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [editing, setEditing] = useState(false);
  const [deviceForm, setDeviceForm] = useState({
    name: '',
    type: '',
    description: '',
    macAddress: '',
    ipAddress: '',
    networkId: ''
  });

  // Mock networks for dropdown
  const [networks] = useState([
    { id: 1, name: 'Main Office Network' },
    { id: 2, name: 'Guest Network' },
    { id: 3, name: 'IoT Network' }
  ]);

  // Fetch device details
  useEffect(() => {
    const fetchDevice = async () => {
      setLoading(true);
      try {
        // In a real app, you would fetch data from your API
        // const result = await deviceService.getDeviceById(id);
        // if (result.success) {
        //   setDevice(result.data);
        //   setDeviceForm({
        //     name: result.data.name,
        //     type: result.data.type,
        //     description: result.data.description || '',
        //     macAddress: result.data.macAddress,
        //     ipAddress: result.data.ipAddress,
        //     networkId: result.data.networkId.toString()
        //   });
        // } else {
        //   setError('Failed to fetch device details');
        // }

        // Mock implementation
        setTimeout(() => {
          if (mockDevice.id.toString() === id) {
            setDevice(mockDevice);
            setDeviceForm({
              name: mockDevice.name,
              type: mockDevice.type,
              description: mockDevice.description || '',
              macAddress: mockDevice.macAddress,
              ipAddress: mockDevice.ipAddress,
              networkId: mockDevice.networkId.toString()
            });
          } else {
            setError('Device not found');
          }
          setLoading(false);
        }, 1000);
      } catch (err) {
        setError('An error occurred while fetching device details');
        setLoading(false);
      }
    };

    fetchDevice();
  }, [id, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDeviceForm({
      ...deviceForm,
      [name]: value
    });
  };

  const toggleEditing = () => {
    setEditing(!editing);
  };

  // Save device changes
  const handleSaveDevice = (e) => {
    e.preventDefault();
    
    // In a real app, you would send updates to your API
    // const result = await deviceService.updateDevice(id, deviceForm);
    
    // Update local state
    setDevice({
      ...device,
      name: deviceForm.name,
      type: deviceForm.type,
      description: deviceForm.description,
      macAddress: deviceForm.macAddress,
      ipAddress: deviceForm.ipAddress,
      networkId: parseInt(deviceForm.networkId),
      networkName: networks.find(n => n.id.toString() === deviceForm.networkId)?.name || ''
    });
    
    setEditing(false);
  };

  // Delete device
  const handleDeleteDevice = () => {
    if (window.confirm('Are you sure you want to delete this device? This action cannot be undone.')) {
      // In a real app, you would send a delete request to your API
      // const result = await deviceService.deleteDevice(id);
      navigate('/devices');
    }
  };

  // Block or unblock device
  const handleToggleBlock = () => {
    const isBlocked = device.status === 'blocked';
    const message = isBlocked
      ? 'Are you sure you want to unblock this device?'
      : 'Are you sure you want to block this device?';
    
    if (window.confirm(message)) {
      // In a real app, you would call your API
      // const result = await isBlocked 
      //   ? deviceService.unblockDevice(id)
      //   : deviceService.blockDevice(id);
      
      setDevice({
        ...device,
        status: isBlocked ? 'online' : 'blocked'
      });
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return <div className="loading-container">Loading device details...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="alert alert-danger">{error}</div>
        <Link to="/devices" className="btn btn-primary">
          Back to Devices
        </Link>
      </div>
    );
  }

  if (!device) {
    return (
      <div className="not-found-container">
        <h2>Device Not Found</h2>
        <p>The device you are looking for does not exist or has been removed.</p>
        <Link to="/devices" className="btn btn-primary">
          Back to Devices
        </Link>
      </div>
    );
  }

  return (
    <div className="device-details-container">
      <div className="page-header">
        <div className="breadcrumbs">
          <Link to="/devices">Devices</Link> / {device.name}
        </div>
        <div className="actions">
          {!editing ? (
            <>
              <button 
                onClick={toggleEditing} 
                className="btn btn-primary"
              >
                Edit Device
              </button>
              <button 
                onClick={handleToggleBlock} 
                className={`btn ${device.status === 'blocked' ? 'btn-success' : 'btn-warning'}`}
              >
                {device.status === 'blocked' ? 'Unblock' : 'Block'} Device
              </button>
              <button 
                onClick={handleDeleteDevice} 
                className="btn btn-danger"
              >
                Delete
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={handleSaveDevice} 
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

      <div className="device-header">
        {editing ? (
          <form onSubmit={handleSaveDevice}>
            <div className="form-group">
              <label htmlFor="name">Device Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={deviceForm.name}
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
                  value={deviceForm.type}
                  onChange={handleInputChange}
                  required
                >
                  <option value="laptop">Laptop</option>
                  <option value="desktop">Desktop</option>
                  <option value="phone">Phone</option>
                  <option value="tablet">Tablet</option>
                  <option value="printer">Printer</option>
                  <option value="tv">TV</option>
                  <option value="thermostat">Thermostat</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="networkId">Network</label>
                <select
                  id="networkId"
                  name="networkId"
                  value={deviceForm.networkId}
                  onChange={handleInputChange}
                  required
                >
                  {networks.map(network => (
                    <option key={network.id} value={network.id.toString()}>
                      {network.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={deviceForm.description}
                onChange={handleInputChange}
                rows="3"
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="macAddress">MAC Address</label>
                <input
                  type="text"
                  id="macAddress"
                  name="macAddress"
                  value={deviceForm.macAddress}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="ipAddress">IP Address</label>
                <input
                  type="text"
                  id="ipAddress"
                  name="ipAddress"
                  value={deviceForm.ipAddress}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
          </form>
        ) : (
          <>
            <h1>{device.name}</h1>
            <div className="device-meta">
              <span className={`status-badge ${device.status}`}>
                {device.status.charAt(0).toUpperCase() + device.status.slice(1)}
              </span>
              <span className="device-type">
                {device.type.charAt(0).toUpperCase() + device.type.slice(1)}
              </span>
              <span className="network-name">
                Network: {device.networkName}
              </span>
            </div>
            {device.description && (
              <p className="device-description">{device.description}</p>
            )}
          </>
        )}
      </div>

      <div className="device-tabs">
        <ul className="tabs-nav">
          <li 
            className={activeTab === 'overview' ? 'active' : ''}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </li>
          <li 
            className={activeTab === 'activity' ? 'active' : ''}
            onClick={() => setActiveTab('activity')}
          >
            Activity Log
          </li>
          <li 
            className={activeTab === 'bandwidth' ? 'active' : ''}
            onClick={() => setActiveTab('bandwidth')}
          >
            Bandwidth Usage
          </li>
          <li 
            className={activeTab === 'settings' ? 'active' : ''}
            onClick={() => setActiveTab('settings')}
          >
            Settings
          </li>
        </ul>

        <div className="tab-content">
          {activeTab === 'overview' && (
            <div className="overview-tab">
              <div className="info-grid">
                <div className="info-card">
                  <h3>Device Information</h3>
                  <ul className="info-list">
                    <li>
                      <span className="info-label">MAC Address:</span>
                      <span className="info-value">{device.macAddress}</span>
                    </li>
                    <li>
                      <span className="info-label">IP Address:</span>
                      <span className="info-value">{device.ipAddress}</span>
                    </li>
                    <li>
                      <span className="info-label">First Seen:</span>
                      <span className="info-value">{formatDate(device.firstSeen)}</span>
                    </li>
                    <li>
                      <span className="info-label">Last Seen:</span>
                      <span className="info-value">{formatDate(device.lastSeen)}</span>
                    </li>
                  </ul>
                </div>
                
                {device.manufacturer && (
                  <div className="info-card">
                    <h3>Hardware Details</h3>
                    <ul className="info-list">
                      <li>
                        <span className="info-label">Manufacturer:</span>
                        <span className="info-value">{device.manufacturer}</span>
                      </li>
                      <li>
                        <span className="info-label">Model:</span>
                        <span className="info-value">{device.model}</span>
                      </li>
                      {device.os && (
                        <li>
                          <span className="info-label">Operating System:</span>
                          <span className="info-value">{device.os}</span>
                        </li>
                      )}
                    </ul>
                  </div>
                )}
                
                <div className="info-card">
                  <h3>Network</h3>
                  <ul className="info-list">
                    <li>
                      <span className="info-label">Connected to:</span>
                      <span className="info-value">
                        <Link to={`/networks/${device.networkId}`}>
                          {device.networkName}
                        </Link>
                      </span>
                    </li>
                    <li>
                      <span className="info-label">Current Status:</span>
                      <span className="info-value">
                        <span className={`status-badge ${device.status}`}>
                          {device.status.charAt(0).toUpperCase() + device.status.slice(1)}
                        </span>
                      </span>
                    </li>
                  </ul>
                </div>
                
                <div className="info-card">
                  <h3>Bandwidth Summary</h3>
                  <ul className="info-list">
                    <li>
                      <span className="info-label">Today:</span>
                      <span className="info-value">
                        ↓ {device.bandwidth.today.download} {device.bandwidth.today.unit} / 
                        ↑ {device.bandwidth.today.upload} {device.bandwidth.today.unit}
                      </span>
                    </li>
                    <li>
                      <span className="info-label">This Week:</span>
                      <span className="info-value">
                        ↓ {device.bandwidth.week.download} {device.bandwidth.week.unit} / 
                        ↑ {device.bandwidth.week.upload} {device.bandwidth.week.unit}
                      </span>
                    </li>
                    <li>
                      <span className="info-label">This Month:</span>
                      <span className="info-value">
                        ↓ {device.bandwidth.month.download} {device.bandwidth.month.unit} / 
                        ↑ {device.bandwidth.month.upload} {device.bandwidth.month.unit}
                      </span>
                    </li>
                  </ul>
                  <button 
                    onClick={() => setActiveTab('bandwidth')} 
                    className="btn btn-sm btn-outline"
                  >
                    View Detailed Usage
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="activity-tab">
              <h3>Activity Log</h3>
              {device.activity && device.activity.length > 0 ? (
                <table className="activity-table">
                  <thead>
                    <tr>
                      <th>Timestamp</th>
                      <th>Action</th>
                      <th>Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {device.activity.map((activity, index) => (
                      <tr key={index}>
                        <td>{formatDate(activity.timestamp)}</td>
                        <td>{activity.action}</td>
                        <td>{activity.details}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="no-data">
                  No activity records found for this device.
                </div>
              )}
            </div>
          )}

          {activeTab === 'bandwidth' && (
            <div className="bandwidth-tab">
              <h3>Bandwidth Usage</h3>
              <div className="bandwidth-chart-placeholder">
                <p>Bandwidth usage chart will be displayed here.</p>
                <p>Feature coming soon!</p>
              </div>
              <div className="bandwidth-summary">
                <h4>Usage Summary</h4>
                <table className="bandwidth-table">
                  <thead>
                    <tr>
                      <th>Period</th>
                      <th>Download</th>
                      <th>Upload</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Today</td>
                      <td>{device.bandwidth.today.download} {device.bandwidth.today.unit}</td>
                      <td>{device.bandwidth.today.upload} {device.bandwidth.today.unit}</td>
                      <td>
                        {device.bandwidth.today.download + device.bandwidth.today.upload} {device.bandwidth.today.unit}
                      </td>
                    </tr>
                    <tr>
                      <td>This Week</td>
                      <td>{device.bandwidth.week.download} {device.bandwidth.week.unit}</td>
                      <td>{device.bandwidth.week.upload} {device.bandwidth.week.unit}</td>
                      <td>
                        {device.bandwidth.week.download + device.bandwidth.week.upload} {device.bandwidth.week.unit}
                      </td>
                    </tr>
                    <tr>
                      <td>This Month</td>
                      <td>{device.bandwidth.month.download} {device.bandwidth.month.unit}</td>
                      <td>{device.bandwidth.month.upload} {device.bandwidth.month.unit}</td>
                      <td>
                        {device.bandwidth.month.download + device.bandwidth.month.upload} {device.bandwidth.month.unit}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="settings-tab">
              <h3>Device Settings</h3>
              <div className="settings-form">
                <div className="form-group">
                  <label>Bandwidth Limit</label>
                  <select className="form-control">
                    <option value="none">No Limit</option>
                    <option value="5GB">5 GB/month</option>
                    <option value="10GB">10 GB/month</option>
                    <option value="20GB">20 GB/month</option>
                    <option value="50GB">50 GB/month</option>
                  </select>
                </div>
                <div className="form-check">
                  <input 
                    type="checkbox" 
                    id="priorityDevice" 
                    className="form-check-input"
                  />
                  <label htmlFor="priorityDevice" className="form-check-label">
                    Priority Device (QoS)
                  </label>
                </div>
                <div className="form-check">
                  <input 
                    type="checkbox" 
                    id="blockInternet" 
                    className="form-check-input"
                  />
                  <label htmlFor="blockInternet" className="form-check-label">
                    Block Internet Access
                  </label>
                </div>
                <button className="btn btn-primary">Save Device Settings</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeviceDetails;