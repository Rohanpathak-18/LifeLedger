import { useCallback, useEffect, useState } from 'react';
import { Bell, LogOut, MoreHorizontal, Moon, Search, Sun, UserRound } from 'lucide-react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../app/providers.jsx';
import { notificationService } from '../../features/notifications/notification.service.js';

const links = [
  { label: 'Overview', to: '/dashboard', end: true },
  { label: 'Collection', to: '/products' },
  { label: 'Documents', to: '/documents' },
  { label: 'Warranties', to: '/warranties' },
  { label: 'Care', to: '/care' },
  { label: 'Timeline', to: '/timeline' },
  { label: 'Asset values', to: '/assets' },
  { label: 'Family', to: '/family' },
];

export default function Topbar({ onMenu }) {
  const { theme, toggleTheme, signOut } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  const loadUnreadCount = useCallback(async () => {
    try {
      const result = await notificationService.list();
      setUnreadCount(result.unreadCount);
    } catch {
      setUnreadCount(0);
    }
  }, []);

  useEffect(() => {
    loadUnreadCount();
    const interval = window.setInterval(loadUnreadCount, 60_000);
    window.addEventListener('focus', loadUnreadCount);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener('focus', loadUnreadCount);
    };
  }, [loadUnreadCount, pathname]);

  useEffect(() => {
    window.addEventListener('lifeledger:notifications-updated', loadUnreadCount);
    return () =>
      window.removeEventListener('lifeledger:notifications-updated', loadUnreadCount);
  }, [loadUnreadCount]);

  async function handleSignOut() {
    try {
      await signOut();
    } finally {
      navigate('/');
    }
  }

  return (
    <header className="topbar app-navigation-bar">
      <button
        className="icon-button mobile-menu"
        onClick={onMenu}
        aria-label="Open navigation"
      >
        <MoreHorizontal size={23} />
      </button>
      <Link
        to="/dashboard"
        className="app-nav-brand"
        aria-label="LifeLedger overview"
      >
        <span className="brand-mark">L</span>
        <span>lifeledger</span>
      </Link>
      <nav className="app-nav-links" aria-label="Main navigation">
        {links.map(({ label, to, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              isActive ? 'app-nav-link active' : 'app-nav-link'
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="topbar-actions app-nav-actions">
        <button
          className="search-trigger"
          aria-label="Search your collection"
          onClick={() => navigate('/products')}
        >
          <Search size={15} />
          <span>Search</span>
        </button>
        <Link
          to="/notifications"
          className="icon-button notification-button"
          aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <i className="notification-count">
              {unreadCount > 9 ? '9+' : unreadCount}
            </i>
          )}
        </Link>
        <Link
          to="/profile"
          className="icon-button app-profile-button"
          aria-label="Your profile"
          title="Your profile"
        >
          <UserRound size={17} />
        </Link>
        <button
          className="icon-button app-theme-button"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>
        <button
          className="icon-button app-signout-button"
          onClick={handleSignOut}
          aria-label="Sign out"
          title="Sign out"
        >
          <LogOut size={17} />
        </button>
      </div>
    </header>
  );
}
