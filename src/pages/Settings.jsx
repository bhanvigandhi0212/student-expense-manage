
import { useState } from 'react';
import {
  User,
  Wallet,
  Palette,
  Database,
  Save,
  Sun,
  Moon,
  RotateCcw,
  Download,
} from 'lucide-react';

import { useExpense } from '../context/ExpenseContext';
import { CURRENCIES, DEFAULT_SETTINGS } from '../utils/onstants-temp.js';
import { formatCurrency, transactionsToCSV, downloadCSV } from '../utils/calculations';

function Settings() {
  const {
    settings,
    updateSettings,
    toggleTheme,
    transactions,
    budgets,
    goals,
    loadSampleData,
    resetAllData,
  } = useExpense();

  const [profile, setProfile] = useState({
    name: settings.name || '',
    email: settings.email || '',
    college: settings.college || '',
    course: settings.course || '',
  });

  const [message, setMessage] = useState('');

  const handleProfileSave = (e) => {
    e.preventDefault();
    updateSettings(profile);
    setMessage('Profile updated successfully!');
  };

  const handleCurrencyChange = (e) => {
    updateSettings({ currency: e.target.value });
    setMessage('Currency updated successfully!');
  };

  const handleReset = () => {
    if (!window.confirm('Are you sure? This will permanently delete all your transactions, budgets and goals.')) return;

    resetAllData();
    setProfile({
      name: DEFAULT_SETTINGS.name,
      email: DEFAULT_SETTINGS.email,
      college: DEFAULT_SETTINGS.college,
      course: DEFAULT_SETTINGS.course,
    });
    setMessage('All data has been reset.');
  };

  const handleExport = () => {
    const csv = transactionsToCSV(transactions);
    downloadCSV('studentwallet-all-transactions.csv', csv);
    setMessage('Transactions exported successfully!');
  };

  const currency = settings.currency || 'INR';

  return (
    <div className="settings-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Manage your profile and preferences.</p>
        </div>
      </div>

      {message && (
        <div className="settings-notice">
          {message}
          <button onClick={() => setMessage('')}>×</button>
        </div>
      )}

      <section className="card settings-card">
        <div className="settings-heading">
          <User size={22} />
          <div>
            <h3>Profile Information</h3>
            <p>Update your personal details.</p>
          </div>
        </div>

        <form onSubmit={handleProfileSave}>
          <div className="settings-form-grid">
            {[
              ['name', 'Full name', 'Enter your name'],
              ['email', 'Email address', 'Enter your email'],
              ['college', 'College', 'Enter college name'],
              ['course', 'Course', 'e.g. B.Tech CSE'],
            ].map(([key, label, placeholder]) => (
              <div className="form-group" key={key}>
                <label>{label}</label>
                <input
                  className="input"
                  type={key === 'email' ? 'email' : 'text'}
                  placeholder={placeholder}
                  value={profile[key]}
                  onChange={(e) =>
                    setProfile((prev) => ({
                      ...prev,
                      [key]: e.target.value,
                    }))
                  }
                />
              </div>
            ))}
          </div>

          <button className="btn btn-primary" type="submit">
            <Save size={16} /> Save profile
          </button>
        </form>
      </section>

      <section className="card settings-card">
        <div className="settings-heading">
          <Wallet size={22} />
          <div>
            <h3>Currency</h3>
            <p>Choose the currency used throughout StudentWallet.</p>
          </div>
        </div>

        <select
          className="input settings-select"
          value={currency}
          onChange={handleCurrencyChange}
        >
          {CURRENCIES.map((item) => (
            <option key={item.code} value={item.code}>
              {item.label}
            </option>
          ))}
        </select>

        <p className="settings-preview">
          Example: {formatCurrency(12500, currency)}
        </p>
      </section>

      <section className="card settings-card">
        <div className="settings-heading">
          <Palette size={22} />
          <div>
            <h3>Appearance</h3>
            <p>Customize your application theme.</p>
          </div>
        </div>

        <div className="settings-theme-row">
          <div>
            {settings.theme === 'dark' ? <Moon /> : <Sun />}
            <strong>{settings.theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</strong>
          </div>

          <button className="btn btn-outline" onClick={toggleTheme}>
            Switch to {settings.theme === 'dark' ? 'Light' : 'Dark'}
          </button>
        </div>
      </section>

      <section className="card settings-card">
        <div className="settings-heading">
          <Database size={22} />
          <div>
            <h3>Data Management</h3>
            <p>Manage your saved StudentWallet data.</p>
          </div>
        </div>

        <div className="settings-data-grid">
          <div><span>Transactions</span><strong>{transactions.length}</strong></div>
          <div><span>Goals</span><strong>{goals.length}</strong></div>
          <div><span>Budget categories</span><strong>{Object.keys(budgets.categories || {}).filter((key) => Number(budgets.categories[key]) > 0).length}</strong></div>
        </div>

        <div className="settings-actions">
          <button className="btn btn-outline" onClick={handleExport}>
            <Download size={16} /> Export transactions
          </button>

          <button
            className="btn btn-outline"
            onClick={() => {
              if (window.confirm('Load sample data? This will replace your current transactions, budgets and goals.')) {
                loadSampleData();
                setMessage('Sample data loaded.');
              }
            }}
          >
            Load sample data
          </button>

          <button className="btn btn-danger" onClick={handleReset}>
            <RotateCcw size={16} /> Reset all data
          </button>
        </div>
      </section>
    </div>
  );
}

export default Settings;
