import { NavLink } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useAuth } from '../../app/providers.jsx';
import {
  Boxes,
  ChevronRight,
  FileText,
  LayoutDashboard,
  Bell,
  Moon,
  ShieldCheck,
  Sun,
  Wrench,
  X,
  History,
  ChartNoAxesColumnIncreasing,
  UsersRound,
} from 'lucide-react';

const links = [
  { label: 'Overview', to: '/dashboard', icon: LayoutDashboard, end: true },
  { label: 'My collection', to: '/products', icon: Boxes },
  { label: 'Documents', to: '/documents', icon: FileText },
  { label: 'Warranties', to: '/warranties', icon: ShieldCheck },
  { label: 'Care & repairs', to: '/care', icon: Wrench },
  { label: 'Life timeline', to: '/timeline', icon: History },
  { label: 'Asset values', to: '/assets', icon: ChartNoAxesColumnIncreasing },
  { label: 'Family ledger', to: '/family', icon: UsersRound },
  { label: 'Notifications', to: '/notifications', icon: Bell },
];

export default function Sidebar({ open, onClose }) {
  const { user, theme, toggleTheme } = useAuth();

  return (
    <>
      {open && (
        <button
          className="mobile-scrim"
          onClick={onClose}
          aria-label="Close navigation"
        />
      )}
      <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
        <div className="brand">
          <span className="brand-mark">L</span>
          <span>
            lifeledger<small>YOUR THINGS, THOUGHTFULLY KEPT</small>
          </span>
          <button
            className="icon-button close-nav"
            onClick={onClose}
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>
        <Link to="/dashboard" className="workspace" onClick={onClose}>
          <div className="workspace-icon">L</div>
          <span>
            Your home<small>Personal collection</small>
          </span>
        </Link>
        <div className="nav-caption">YOUR SPACE</div>
        <nav className="navigation">
          {links.map(({ label, to, icon: Icon, count, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                `nav-link ${isActive ? 'active' : ''}`
              }
            >
              <Icon size={18} />
              <span>{label}</span>
              {count && <span className="nav-count">{count}</span>}
            </NavLink>
          ))}
        </nav>
        <div className="nav-caption tools-caption">PREFERENCES</div>
        <button
          className="nav-link theme-toggle"
          role="switch"
          aria-checked={theme === 'dark'}
          onClick={toggleTheme}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          <span>
            {theme === 'dark' ? 'Light appearance' : 'Dark appearance'}
          </span>
          <span
            className={`toggle-track ${theme === 'dark' ? 'toggle-on' : ''}`}
          >
            <i />
          </span>
        </button>
        <div className="sidebar-bottom">
          <div className="care-card">
            <div className="care-icon">
              <ShieldCheck size={17} />
            </div>
            <div>
              <strong>All in good hands</strong>
              <p>Your collection is private and secure.</p>
            </div>
          </div>
          <Link to="/profile" className="profile" onClick={onClose} title="Your profile">
            <span className="avatar">{user?.name?.trim()?.[0]?.toUpperCase() || 'L'}</span>
            <span className="profile-info">
              <strong>{user?.name || 'Your profile'}</strong>
              <small>{user?.email || 'Personal account'}</small>
            </span>
            <ChevronRight size={16} />
          </Link>
        </div>
      </aside>
    </>
  );
}
