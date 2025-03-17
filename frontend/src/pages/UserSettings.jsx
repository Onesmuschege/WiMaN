import { useState, useEffect } from 'react';

const UserSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [settings, setSettings] = useState({
    notificationsEnabled: false,
    emailNotifications: false,
    darkMode: false,
    language: 'en',
    timeZone: 'UTC',
    dateFormat: 'MM/DD/YYYY'
  });

  // Simulate fetching user settings
  useEffect(() => {
    const fetchSettings = async () => {
      // In a real app, you would fetch settings from your API
      setTimeout(() => {
        // Mock data
        setSettings({
          notificationsEnabled: true,
          emailNotifications: true,
          darkMode: localStorage.getItem('darkMode') === 'true',
          language: 'en',
          timeZone: 'UTC',
          dateFormat: 'MM/DD/YYYY'
        });
        setLoading(false);
      }, 1000);
    };

    fetchSettings();
  }, []);

  // Handle toggle change for boolean settings
  const handleToggleChange = (e) => {
    const { name, checked } = e.target;
    setSettings({
      ...settings,
      [name]: checked
    });

    // If toggling dark mode, update localStorage
    if (name === 'darkMode') {
      localStorage.setItem('darkMode', checked);
      // In a real app, you might apply dark mode dynamically here
    }
  };

  // Handle select change for dropdown settings
  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    setSettings({
      ...settings,
      [name]: value
    });
  };

  // Save settings
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      // In a real app, you would send settings to your API
      setTimeout(() => {
        setSuccess('Settings saved successfully');
        setSaving(false);
      }, 1000);
    } catch (err) {
      setError('Failed to save settings');
      setSaving(false);
    }
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      // In a real app, you would call your API to delete the account
      console.log('Account deleted');
    }
  };

  if (loading) {
    return <div className="loading-container">Loading settings...</div>;
  }

  return (
    <div className="settings-container">
      <h1>User Settings</h1>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={handleSaveSettings}>
        <div className="settings-card">
          <h2>General Settings</h2>

          <div className="settings-section">
            <div className="form-group">
              <label htmlFor="language">Language</label>
              <select
                id="language"
                name="language"
                value={settings.language}
                onChange={handleSelectChange}
                className="form-control"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="sw">Swahili</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="timeZone">Time Zone</label>
              <select
                id="timeZone"
                name="timeZone"
                value={settings.timeZone}
                onChange={handleSelectChange}
                className="form-control"
              >
                <option value="UTC">UTC</option>
                <option value="EAT">East Africa Time (EAT)</option>
                <option value="EST">Eastern Standard Time (EST)</option>
                <option value="CST">Central Standard Time (CST)</option>
                <option value="PST">Pacific Standard Time (PST)</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="dateFormat">Date Format</label>
              <select
                id="dateFormat"
                name="dateFormat"
                value={settings.dateFormat}
                onChange={handleSelectChange}
                className="form-control"
              >
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>

            <div className="form-check">
              <input
                type="checkbox"
                id="darkMode"
                name="darkMode"
                checked={settings.darkMode}
                onChange={handleToggleChange}
                className="form-check-input"
              />
              <label htmlFor="darkMode" className="form-check-label">
                Dark Mode
              </label>
              <small>Changes the appearance of the application to dark theme.</small>
            </div>
          </div>
        </div>

        <div className="settings-card">
          <h2>Notification Settings</h2>

          <div className="settings-section">
            <div className="form-check">
              <input
                type="checkbox"
                id="notificationsEnabled"
                name="notificationsEnabled"
                checked={settings.notificationsEnabled}
                onChange={handleToggleChange}
                className="form-check-input"
              />
              <label htmlFor="notificationsEnabled" className="form-check-label">
                Enable Notifications
              </label>
              <small>Receive notifications about important events and alerts.</small>
            </div>

            <div className="form-check">
              <input
                type="checkbox"
                id="emailNotifications"
                name="emailNotifications"
                checked={settings.emailNotifications}
                onChange={handleToggleChange}
                className="form-check-input"
                disabled={!settings.notificationsEnabled}
              />
              <label htmlFor="emailNotifications" className="form-check-label">
                Email Notifications
              </label>
              <small>Receive notifications via email.</small>
            </div>
          </div>
        </div>

        <div className="settings-card">
          <h2>Security Settings</h2>

          <div className="settings-section">
            <p>
              <strong>Last Login:</strong> {new Date().toLocaleString()}
            </p>
            <p>
              <strong>Account Created:</strong> January 15, 2023
            </p>

            <div className="form-group">
              <button type="button" className="btn btn-secondary">
                Change Password
              </button>
              <small>Change your account password for better security.</small>
            </div>

            <div className="form-group">
              <button type="button" className="btn btn-outline btn-danger" onClick={handleDeleteAccount}>
                Delete Account
              </button>
              <small>Permanently delete your account and all associated data.</small>
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
            onClick={() => window.location.reload()}
          >
            Reset Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserSettings;