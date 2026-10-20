import { useCallback, useEffect, useState } from 'react';
import {
  ArrowUpRight,
  Bell,
  CheckCheck,
  FileText,
  Package,
  ShieldCheck,
  Wrench,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { notificationService } from '../notification.service.js';

const icons = {
  activity: Package,
  warranty: ShieldCheck,
  document: FileText,
  repair: Wrench,
};

function notificationIcon(item) {
  if (item.kind === 'warranty') return icons.warranty;
  if (item.title.toLowerCase().includes('document')) return icons.document;
  if (
    item.title.toLowerCase().includes('repair') ||
    item.title.toLowerCase().includes('maintenance')
  )
    return icons.repair;
  return icons.activity;
}

export default function NotificationsPage() {
  const [items, setItems] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [emailAlertsConfigured, setEmailAlertsConfigured] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const load = useCallback(async () => {
    setError('');
    try {
      const result = await notificationService.list();
      setItems(result.items);
      setUnreadCount(result.unreadCount);
      setEmailAlertsConfigured(result.emailAlertsConfigured);
    } catch (requestError) {
      setError(
        requestError.response?.data?.error?.message ||
          'Could not load your notifications.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function markAllRead() {
    try {
      await notificationService.markAllRead();
      setItems((current) =>
        current.map((item) => ({
          ...item,
          readAt: item.readAt || new Date().toISOString(),
        })),
      );
      setUnreadCount(0);
      toast.success('You are all caught up.');
    } catch (requestError) {
      toast.error(
        requestError.response?.data?.error?.message ||
          'Could not update notifications.',
      );
    }
  }

  async function openNotification(item) {
    if (!item.readAt) {
      try {
        await notificationService.markRead(item._id);
        setItems((current) =>
          current.map((row) =>
            row._id === item._id
              ? { ...row, readAt: new Date().toISOString() }
              : row,
          ),
        );
        setUnreadCount((count) => Math.max(0, count - 1));
      } catch {
        // Keep navigation available even if marking read fails.
      }
    }
    navigate(item.href || '/notifications');
  }

  return (
    <main className="main-content notifications-page">
      <div className="collection-page-heading">
        <div>
          <span className="section-kicker">A RECORD OF WHAT CHANGES</span>
          <h1>
            Your notifications,
            <br />
            <em>all in one place.</em>
          </h1>
          <p>New items, saved documents, and important warranty reminders.</p>
        </div>
        {unreadCount > 0 && (
          <button className="secondary-button" onClick={markAllRead}>
            <CheckCheck size={15} /> Mark all as read
          </button>
        )}
      </div>

      {error && (
        <div className="inline-error" role="alert">
          {error}
          <button onClick={load}>Try again</button>
        </div>
      )}
      <div className="email-alert-note">
        <ShieldCheck size={17} />
        <span>
          <strong>Warranty email reminders</strong>
          <small>
            {emailAlertsConfigured
              ? 'Reminders for warranties ending within 30 days are sent to your sign-in email.'
              : 'In-app reminders are active. Email delivery needs to be configured for this LifeLedger server.'}
          </small>
        </span>
      </div>
      <section className="notification-feed" aria-label="Notifications">
        {loading ? (
          <p className="muted-copy">Loading your notifications…</p>
        ) : items.length ? (
          items.map((item) => {
            const Icon = notificationIcon(item);
            return (
              <button
                className={`notification-row ${item.readAt ? 'is-read' : 'is-unread'}`}
                key={item._id}
                onClick={() => openNotification(item)}
              >
                <span
                  className={`notification-icon ${item.kind === 'warranty' ? 'is-warranty' : ''}`}
                >
                  <Icon size={17} />
                </span>
                <span className="notification-copy">
                  <strong>{item.title}</strong>
                  <span>{item.message}</span>
                  <small>{new Date(item.createdAt).toLocaleString()}</small>
                </span>
                {!item.readAt && (
                  <i className="notification-unread-dot" aria-label="Unread" />
                )}
                <ArrowUpRight className="notification-arrow" size={15} />
              </button>
            );
          })
        ) : (
          !error && (
            <div className="inventory-empty notification-empty">
              <span className="dashboard-empty-icon">
                <Bell size={21} />
              </span>
              <h2>You’re all caught up</h2>
              <p>
                When you add or update something, you’ll find a note about it
                here.
              </p>
              <Link to="/products/new" className="empty-link">
                Add your first item <ArrowUpRight size={14} />
              </Link>
            </div>
          )
        )}
      </section>
    </main>
  );
}
