import { useState } from 'react';
import { Search, Sun, Moon, Bell, Menu } from 'lucide-react';
import { useExpense } from '../context/ExpenseContext';

function Navbar({ setSidebarOpen }) {
  const { theme, toggleTheme } = useExpense();
  const [search, setSearch] = useState('');

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button
          className="mobile-menu-btn"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu size={22} />
        </button>

        <div>
          <h2>Welcome back!</h2>
          <p>Here's your financial overview.</p>
        </div>
      </div>

      <div className="navbar-right">
        <div className="navbar-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search transactions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <button
          className="navbar-icon-btn"
          onClick={toggleTheme}
          title="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <button className="navbar-icon-btn" title="Notifications">
          <Bell size={20} />
        </button>

        <div className="navbar-profile">
          <div className="profile-avatar">S</div>
          <div className="profile-info">
            <strong>Student</strong>
            <span>My Account</span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;