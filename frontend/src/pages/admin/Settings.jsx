// src/pages/admin/Settings.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { adminService } from '../../services/apiService';

const AdminSettings = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  
  const [settings, setSettings] = useState({
    systemName: 'WIMAN Network Management',
    adminEmail: 'admin@wiman.com',
    defaultLanguage: 'en',
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireNumbers: true,
      requireSpecialChars: true
    },
    allowRegistration: true,
    requireEmailVerification: true,
    maintenanceMode: false
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Check if user is admin
  useEffect(() => {
    if (!isAdmin()) {
      navigate('/dashboard');
    }
  }, [isAdmin, navigate]);

  // Fetch system settings
  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        // Use adminService instead of setTimeout mock
        const result = await adminService.getSystemSettings();
        if (result.success) {
          setSettings(result.data);
        } else {
          setError('Failed to load system settings');
        }
      } catch (err) {
        setError('Failed to load system settings');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // Handle input change for text fields and selects
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSettings({
      ...settings,
      [name]: value
    });
  };

  // Handle input change for number fields
  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    setSettings({
      ...settings,
      [name]: parseInt(value, 10)
    });
  };

  // Handle checkbox change
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setSettings({
      ...settings,
      [name]: checked
    });
  };

  // Handle password policy change
  const handlePasswordPolicyChange = (e) => {
    const { name, checked, type, value } = e.target;
    
    if (type === 'checkbox') {
      setSettings({
        ...settings,
        passwordPolicy: {
          ...settings.passwordPolicy,
          [name]: checked
        }
      });
    } else {
      setSettings({
        ...settings,
        passwordPolicy: {
          ...settings.passwordPolicy,
          [name]: parseInt(value, 10)
        }
      });
    }
  };

  // Save system settings
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      // Use adminService instead of setTimeout mock
      const result = await adminService.updateSystemSettings(settings);
      if (result.success) {
        setSuccess('System settings saved successfully');
      } else {
        setError(result.error || 'Failed to save system settings');
      }
    } catch (err) {
      setError('Failed to save system settings');
    } finally {
      setSaving(false);
    }
  };

  // Reset to default settings
  const handleResetDefaults = () => {
    if (window.confirm('Are you sure you want to reset to default settings? All custom settings will be lost.')) {
      setSettings({
        systemName: 'WIMAN Network Management',
        adminEmail: 'admin@wiman.com',
        defaultLanguage: 'en',
        sessionTimeout: 30,
        maxLoginAttempts: 5,
        passwordPolicy: {
          minLength: 8,
          requireUppercase: true,
          requireNumbers: true,
          requireSpecialChars: true
        },
        allowRegistration: true,
        requireEmailVerification: true,
        maintenanceMode: false
      });
      setSuccess('Settings reset to defaults');
    }
  };

  // Toggle maintenance mode
  const handleToggleMaintenance = async () => {
    const newMode = !settings.maintenanceMode;
    const message = newMode 
      ? 'Are you sure you want to enable maintenance mode? This will prevent users from logging in.'
      : 'Are you sure you want to disable maintenance mode?';
    
    if (window.confirm(message)) {
      try {
        const result = await adminService.toggleMaintenanceMode(newMode);
        if (result.success) {
          setSettings({
            ...settings,
            maintenanceMode: newMode
          });
          
          setSuccess(newMode 
            ? 'Maintenance mode enabled'
            : 'Maintenance mode disabled'
          );
        } else {
          setError(result.error || 'Failed to toggle maintenance mode');
        }
      } catch (err) {
        setError('Failed to toggle maintenance mode');
      }
    }
  };

  if (loading) {
    return <div className="loading-container">Loading system settings...</div>;
  }

  return (
    <div className="admin-settings-container">
      <h1>System Settings</h1>
      
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      
      <form onSubmit={handleSaveSettings}>
        <div className="settings-card">
          <h2>General Settings</h2>
          
          <div className="settings-section">
            <div className="form-group">
              <label htmlFor="systemName">System Name</label>
              <input
                type="text"
                id="systemName"
                name="systemName"
                value={settings.systemName}
                onChange={handleInputChange}
                required
              />
              <small>The name of your WIMAN installation</small>
            </div>
            
            <div className="form-group">
              <label htmlFor="adminEmail">Admin Email</label>
              <input
                type="email"
                id="adminEmail"
                name="adminEmail"
                value={settings.adminEmail}
                onChange={handleInputChange}
                required
              />
              <small>System notifications will be sent to this email</small>
            </div>
            
            <div className="form-group">
              <label htmlFor="defaultLanguage">Default Language</label>
              <select
                id="defaultLanguage"
                name="defaultLanguage"
                value={settings.defaultLanguage}
                onChange={handleInputChange}
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="sw">Swahili</option>
              </select>
              <small>Default language for new users</small>
            </div>
          </div>
        </div>
        
        <div className="settings-card">
          <h2>Security Settings</h2>
          
          <div className="settings-section">
            <div className="form-group">
              <label htmlFor="sessionTimeout">Session Timeout (minutes)</label>
              <input
                type="number"
                id="sessionTimeout"
                name="sessionTimeout"
                value={settings.sessionTimeout}
                onChange={handleNumberChange}
                min="5"
                max="240"
                required
              />
              <small>Time in minutes before an inactive session is logged out</small>
            </div>
            
            <div className="form-group">
              <label htmlFor="maxLoginAttempts">Max Login Attempts</label>
              <input
                type="number"
                id="maxLoginAttempts"
                name="maxLoginAttempts"
                value={settings.maxLoginAttempts}
                onChange={handleNumberChange}
                min="3"
                max="10"
                required
              />
              <small>Number of failed login attempts before account is locked</small>
            </div>
            
            <h3>Password Policy</h3>
            
            <div className="form-group">
              <label htmlFor="minLength">Minimum Password Length</label>
              <input
                type="number"
                id="minLength"
                name="minLength"
                value={settings.passwordPolicy.minLength}
                onChange={handlePasswordPolicyChange}
                min="6"
                max="20"
                required
              />
            </div>
            
            <div className="form-check">
              <input
                type="checkbox"
                id="requireUppercase"
                name="requireUppercase"
                checked={settings.passwordPolicy.requireUppercase}
                onChange={handlePasswordPolicyChange}
              />
              <label htmlFor="requireUppercase">Require Uppercase Letters</label>
            </div>
            
            <div className="form-check">
              <input
                type="checkbox"
                id="requireNumbers"
                name="requireNumbers"
                checked={settings.passwordPolicy.requireNumbers}
                onChange={handlePasswordPolicyChange}
              />
              <label htmlFor="requireNumbers">Require Numbers</label>
            </div>
            
            <div className="form-check">
              <input
                type="checkbox"
                id="requireSpecialChars"
                name="requireSpecialChars"
                checked={settings.passwordPolicy.requireSpecialChars}
                onChange={handlePasswordPolicyChange}
              />
              <label htmlFor="requireSpecialChars">Require Special Characters</label>
            </div>
          </div>
        </div>
        
        <div className="settings-card">
          <h2>User Registration</h2>
          
          <div className="settings-section">
            <div className="form-check">
              <input
                type="checkbox"
                id="allowRegistration"
                name="allowRegistration"
                checked={settings.allowRegistration}
                onChange={handleCheckboxChange}
              />
              <label htmlFor="allowRegistration">Allow Public Registration</label>
              <small>If disabled, only administrators can create new accounts</small>
            </div>
            
            <div className="form-check">
              <input
                type="checkbox"
                id="requireEmailVerification"
                name="requireEmailVerification"
                checked={settings.requireEmailVerification}
                onChange={handleCheckboxChange}
                disabled={!settings.allowRegistration}
              />
              <label htmlFor="requireEmailVerification">Require Email Verification</label>
              <small>Users must verify their email address before logging in</small>
            </div>
          </div>
        </div>
        
        <div className="settings-card">
          <h2>Maintenance</h2>
          
          <div className="settings-section">
            <div className="maintenance-mode">
              <div className="mode-status">
                <h3>Maintenance Mode</h3>
                <span className={`status-badge ${settings.maintenanceMode ? 'active' : 'inactive'}`}>
                  {settings.maintenanceMode ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <p>
                When maintenance mode is enabled, only administrators can access the system.
                All other users will see a maintenance message.
              </p>
              <button 
                type="button" 
                onClick={handleToggleMaintenance}
                className={`btn ${settings.maintenanceMode ? 'btn-success' : 'btn-warning'}`}
              >
                {settings.maintenanceMode ? 'Disable Maintenance Mode' : 'Enable Maintenance Mode'}
              </button>
            </div>
            
            <div className="system-backup">
              <h3>System Backup</h3>
              <p>
                Create a backup of all system settings and data.
                Backups do not include user uploaded files.
              </p>
              <button type="button" className="btn btn-primary">
                Create Backup
              </button>
              <button type="button" className="btn btn-secondary">
                Restore from Backup
              </button>
            </div>
          </div>
        </div>
        
        <div className="form-actions">
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={handleResetDefaults}
          >
            Reset to Defaults
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminSettings;