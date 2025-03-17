// src/pages/Networks.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Networks = () => {
  const [networks, setNetworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newNetwork, setNewNetwork] = useState({
    name: '',
    type: 'wifi',
    description: '',
    status: 'active'
  });

  // Mock networks data
  const mockNetworks = [
    {
      id: 1, 
      name: 'Main Office Network', 
      type: 'wifi', 
      status: 'active',
      connectedDevices: 12, 
      createdAt: '2023-05-15'
    },
    {
      id: 2, 
      name: 'Guest Network', 
      type: 'wifi', 
      status: 'active',
      connectedDevices: 5, 
      createdAt: '2023-06-20'
    },
    {
      id: 3, 
      name: 'IoT Network', 
      type: 'wifi', 
      status: 'active',
      connectedDevices: 8, 
      createdAt: '2023-07-12'
    },
    {
      id: 4, 
      name: 'Development Network', 
      type: 'ethernet', 
      status: 'inactive',
      connectedDevices: 0, 
      createdAt: '2023-04-10'
    },
    {
      id: 5, 
      name: 'Meeting Room', 
      type: 'wifi', 
      status: 'active',
      connectedDevices: 3, 
      createdAt: '2023-09-05'
    }
  ];

  // Simulate API call to fetch networks
  useEffect(() => {
    // In a real app, you would fetch data from your API
    const fetchNetworks = async () => {
      setLoading(true);
      try {
        // Simulating API delay
        setTimeout(() => {
          setNetworks(mockNetworks);
          setLoading(false);
        }, 1000);
      } catch (err) {
        setError('Failed to fetch networks');
        setLoading(false);
      }
    };

    fetchNetworks();
  }, []);

  // Handle changes in the form for adding a new network
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewNetwork({
      ...newNetwork,
      [name]: value
    });
  };

  // Handle form submission for adding a new network
  const handleAddNetwork = (e) => {
    e.preventDefault();
    
    // In a real app, you would send this data to your API
    const newNetworkWithId = {
      ...newNetwork,
      id: networks.length + 1,
      connectedDevices: 0,
      createdAt: new Date().toISOString().split('T')[0]
    };
    
    setNetworks([...networks, newNetworkWithId]);
    setShowAddModal(false);
    setNewNetwork({
      name: '',
      type: 'wifi',
      description: '',
      status: 'active'
    });
  };

  // Filter networks based on search term
  const filteredNetworks = networks.filter(network =>
    network.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    network.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="loading-container">Loading networks...</div>;
  }

  return (
    <div className="networks-container">
      <div className="page-header">
        <h1>Networks</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowAddModal(true)}
        >
          Add Network
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="networks-controls">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search networks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {filteredNetworks.length === 0 ? (
        <div className="no-data">
          {searchTerm ? (
            <p>No networks match your search criteria.</p>
          ) : (
            <p>No networks found. Add your first network to get started.</p>
          )}
        </div>
      ) : (
        <div className="networks-grid">
          <table className="networks-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Status</th>
                <th>Connected Devices</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredNetworks.map(network => (
                <tr key={network.id}>
                  <td>
                    <Link to={`/networks/${network.id}`} className="network-name">
                      {network.name}
                    </Link>
                  </td>
                  <td>{network.type === 'wifi' ? 'Wi-Fi' : 'Ethernet'}</td>
                  <td>
                    <span className={`status-badge ${network.status}`}>
                      {network.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>{network.connectedDevices}</td>
                  <td>{network.createdAt}</td>
                  <td>
                    <div className="action-buttons">
                      <Link 
                        to={`/networks/${network.id}`} 
                        className="btn btn-sm btn-primary"
                      >
                        View
                      </Link>
                      <button className="btn btn-sm btn-secondary">Edit</button>
                      <button className="btn btn-sm btn-danger">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Network Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Add New Network</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="modal-close"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleAddNetwork}>
              <div className="form-group">
                <label htmlFor="name">Network Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={newNetwork.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="type">Network Type</label>
                <select
                  id="type"
                  name="type"
                  value={newNetwork.type}
                  onChange={handleInputChange}
                  required
                >
                  <option value="wifi">Wi-Fi</option>
                  <option value="ethernet">Ethernet</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="description">Description (Optional)</label>
                <textarea
                  id="description"
                  name="description"
                  value={newNetwork.description}
                  onChange={handleInputChange}
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label htmlFor="status">Status</label>
                <select
                  id="status"
                  name="status"
                  value={newNetwork.status}
                  onChange={handleInputChange}
                  required
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="modal-actions">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                >
                  Add Network
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Networks;