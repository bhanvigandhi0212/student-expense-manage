import { NavLink } from 'react-router-dom';
import {
  GraduationCap,
  LayoutDashboard,
  ArrowLeftRight,
  TrendingDown,
  TrendingUp,
  Wallet,
  BarChart3,
  Target,
  Settings,
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Transactions', path: '/transactions', icon: ArrowLeftRight },
  { name: 'Expenses', path: '/expenses', icon: TrendingDown },
  { name: 'Income', path: '/income', icon: TrendingUp },
  { name: 'Budgets', path: '/budgets', icon: Wallet },
  { name: 'Analytics', path: '/analytics', icon: BarChart3 },
  { name: 'Savings Goals', path: '/goals', icon: Target },
  { name: 'Settings', path: '/settings', icon: Settings },
];

function Sidebar({ sidebarOpen, setSidebarOpen }) {
  return (
    <>
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-brand">
          <div className="brand-icon">
            <GraduationCap size={25} />
          </div>
          <div>
            <h2>StudentWallet</h2>
            <p>Manage your money</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <p className="nav-section-title">MENU</p>

          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `nav-link ${isActive ? 'active' : ''}`
                }
                onClick={() => setSidebarOpen(false)}
              >
                <Icon size={20} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <p>StudentWallet v1.0</p>
          <span>Made for smarter spending.</span>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;