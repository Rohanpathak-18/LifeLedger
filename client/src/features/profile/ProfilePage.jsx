import { useEffect, useState } from 'react';
import { CalendarDays, Check, LockKeyhole, LogOut, Moon, Sun, UserRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../app/providers.jsx';

const memberSince = (date) => {
  if (!date) return 'Recently joined';
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return 'Recently joined';
  return new Intl.DateTimeFormat(undefined, {
    month: 'long',
    year: 'numeric',
  }).format(parsed);
};

const initials = (name = '') =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'LL';

export default function ProfilePage() {
  const { user, updateProfile, theme, toggleTheme, signOut } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => setName(user?.name || ''), [user?.name]);

  async function saveProfile(event) {
    event.preventDefault();
    setSaving(true);
    try {
      await updateProfile({ name: name.trim() });
      toast.success('Your profile has been updated.');
    } catch (error) {
      toast.error(
        error.response?.data?.error?.message || 'Could not update your profile.',
      );
    } finally {
      setSaving(false);
    }
  }

  async function leaveAccount() {
    try {
      await signOut();
    } finally {
      navigate('/login');
    }
  }

  return (
    <main className="main-content profile-page">
      <div className="collection-page-heading">
        <div>
          <span className="section-kicker">YOUR ACCOUNT</span>
          <h1>
            A little more <em>about you.</em>
          </h1>
          <p>Manage your personal details and LifeLedger preferences.</p>
        </div>
      </div>

      <section className="profile-hero" aria-label="Account summary">
        <span className="profile-avatar-large" aria-hidden="true">
          {initials(user?.name)}
        </span>
        <div className="profile-hero-copy">
          <span className="section-kicker">PERSONAL ACCOUNT</span>
          <h2>{user?.name || 'LifeLedger member'}</h2>
          <p>{user?.email}</p>
        </div>
        <span className="profile-active"><i /> Account active</span>
      </section>

      <div className="profile-content-grid">
        <section className="form-panel profile-details-panel">
          <div className="profile-section-heading">
            <span className="timeline-icon"><UserRound size={17} /></span>
            <div>
              <h2>Personal details</h2>
              <p>Keep the name on your account up to date.</p>
            </div>
          </div>
          <form className="record-form profile-form" onSubmit={saveProfile}>
            <label>
              Full name
              <input
                autoComplete="name"
                maxLength={80}
                minLength={2}
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </label>
            <label>
              Email address
              <input value={user?.email || ''} readOnly aria-readonly="true" />
              <small>Your email address is used to sign in.</small>
            </label>
            <div className="form-actions">
              <button type="submit" className="primary-button" disabled={saving}>
                <Check size={14} /> {saving ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          </form>
        </section>

        <aside className="detail-panel profile-account-panel">
          <div className="profile-section-heading">
            <span className="timeline-icon"><LockKeyhole size={16} /></span>
            <div>
              <h2>Account & preferences</h2>
              <p>Your account details at a glance.</p>
            </div>
          </div>
          <div className="profile-meta-row">
            <CalendarDays size={15} />
            <span><small>MEMBER SINCE</small><strong>{memberSince(user?.createdAt)}</strong></span>
          </div>
          <div className="profile-meta-row">
            <LockKeyhole size={15} />
            <span><small>PRIVACY</small><strong>Your collection is private</strong></span>
          </div>
          <div className="profile-theme-row">
            <span>
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
              <strong>{theme === 'dark' ? 'Dark appearance' : 'Light appearance'}</strong>
            </span>
            <button type="button" className="secondary-button" onClick={toggleTheme}>
              Change
            </button>
          </div>
          <div className="profile-signout-row">
            <span>Finished managing your collection?</span>
            <button type="button" className="secondary-button" onClick={leaveAccount}>
              <LogOut size={14} /> Sign out
            </button>
          </div>
        </aside>
      </div>
    </main>
  );
}
