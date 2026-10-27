import { useState } from 'react';
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Boxes,
  Check,
  FileText,
  Menu,
  Moon,
  Package,
  ShieldCheck,
  Sun,
  Wrench,
  X,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../../app/providers.jsx';
import { contactService } from '../contact.service.js';

const photos = {
  architecture: '/images/architecture.svg',
  camera: '/images/valuables.svg',
  belongings: '/images/valuables.svg',
  documents: '/images/documents.svg',
  home: '/images/home.svg',
};

const email = import.meta.env.VITE_CONTACT_EMAIL || 'hello@lifeledger.app';
const navigation = [
  ['Overview', '#overview'],
  ['Collection', '#collection'],
  ['Documents', '#documents'],
  ['Warranties', '#warranties'],
  ['Care & repairs', '#care'],
];

function Brand({ to = '/' }) {
  return (
    <Link className="landing-brand" to={to} aria-label="LifeLedger home">
      <span className="brand-mark">L</span>
      <span>lifeledger</span>
    </Link>
  );
}

function LandingHeader() {
  const { theme, toggleTheme } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <header className="landing-header">
      <Brand />
      <nav
        className={`landing-nav ${menuOpen ? 'is-open' : ''}`}
        aria-label="Main navigation"
      >
        {navigation.map(([label, href]) => (
          <a key={href} href={href} onClick={() => setMenuOpen(false)}>
            {label}
          </a>
        ))}
        <Link
          className="landing-mobile-signin"
          to="/login"
          onClick={() => setMenuOpen(false)}
        >
          Sign in to your LifeLedger
        </Link>
      </nav>
      <div className="landing-header-actions">
        <button
          type="button"
          className="landing-theme-toggle"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>
        <Link className="landing-signin" to="/login">
          Sign in
        </Link>
        <Link className="landing-start-button" to="/register">
          <span className="landing-cta-full">Start your collection</span>
          <span className="landing-cta-compact">Start</span>
          <ArrowUpRight size={15} />
        </Link>
      </div>
      <button
        className="landing-menu-button"
        onClick={() => setMenuOpen((open) => !open)}
        aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
        aria-expanded={menuOpen}
      >
        {menuOpen ? <X size={21} /> : <Menu size={21} />}
      </button>
    </header>
  );
}

function ContactSection() {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form));
    setSending(true);
    try {
      const result = await contactService.send(values);
      form.reset();
      setSent(
        result.emailDelivered
          ? 'Thank you. Your note has been sent.'
          : 'Thank you. Your message was saved; email delivery is not configured yet.',
      );
      toast.success(
        result.emailDelivered
          ? 'Your note is on its way.'
          : 'Your message has been saved.',
      );
    } catch (error) {
      toast.error(
        error.response?.data?.error?.message ||
          'We could not send your note. Please try again.',
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="landing-contact" id="contact">
      <div className="landing-contact-copy">
        <span className="landing-eyebrow">WE’RE HERE TO HELP</span>
        <h2>
          A thoughtful answer
          <br />
          starts with a <em>conversation.</em>
        </h2>
        <p>
          Questions about your collection, privacy, or getting started? Send us
          a note.
        </p>
        <a className="contact-email" href={`mailto:${email}`}>
          <span>EMAIL US DIRECTLY</span>
          {email}
          <ArrowUpRight size={15} />
        </a>
      </div>
      <form className="landing-contact-form" onSubmit={submit}>
        <div className="contact-form-row">
          <label>
            Your name
            <input
              name="name"
              autoComplete="name"
              minLength="2"
              maxLength="100"
              required
            />
          </label>
          <label>
            Email address
            <input
              name="email"
              type="email"
              autoComplete="email"
              maxLength="254"
              required
            />
          </label>
        </div>
        <label>
          Subject
          <input name="subject" minLength="3" maxLength="140" required />
        </label>
        <label>
          Your message
          <textarea
            name="message"
            rows="4"
            minLength="10"
            maxLength="4000"
            required
          />
        </label>
        <label className="contact-trap" aria-hidden="true">
          Leave this field empty
          <input name="website" tabIndex="-1" autoComplete="off" />
        </label>
        <div className="contact-submit-row">
          <span>{sent || 'We’ll reply to the email address you provide.'}</span>
          <button type="submit" disabled={sending}>
            {sending ? 'Sending…' : 'Send your message'}{' '}
            <ArrowRight size={15} />
          </button>
        </div>
      </form>
    </section>
  );
}

export function LandingContent({
  authenticated = false,
  summary,
  loading = false,
}) {
  const startHref = authenticated ? '/products/new' : '/register';
  const collectionHref = authenticated ? '/products' : '/register';
  const recordsHref = authenticated ? '/documents' : '/register';
  const warrantyHref = authenticated ? '/warranties' : '/register';
  return (
    <>
      <main>
        <section className="landing-hero" id="overview">
          <img
            className="landing-hero-image"
            src={photos.architecture}
            alt="A sculptural, curved concrete staircase lit by soft daylight"
          />
          <div className="landing-hero-shade" />
          <div className="landing-hero-copy">
            <span className="landing-eyebrow">
              A MORE CONSIDERED WAY TO KEEP
            </span>
            <h1>
              Everything you own,
              <br />
              kept with <em>intention.</em>
            </h1>
            <p>
              One quiet place for the details that make your things yours: what
              you bought, when it needs care, and what to keep close.
            </p>
            <div className="landing-hero-actions">
              <Link to={startHref} className="landing-primary-button">
                {authenticated
                  ? 'Add an item to your collection'
                  : 'Create your collection'}{' '}
                <ArrowUpRight size={15} />
              </Link>
              <a href="#collection" className="landing-text-button">
                Discover LifeLedger <ArrowDown size={14} />
              </a>
            </div>
          </div>
          <div className="landing-hero-note">
            <span>01 / 05</span>
            <span>Made for the things that matter</span>
          </div>
        </section>

        {authenticated && (
          <section
            className="overview-account"
            aria-label="Your LifeLedger account"
          >
            <div className="overview-account-heading">
              <span className="landing-eyebrow">YOUR LIFELEDGER</span>
              <h2>
                Your collection, <em>at a glance.</em>
              </h2>
              <p>
                The details are here when you need them, kept together in one
                private place.
              </p>
            </div>
            <div className="overview-account-stats">
              <Link to="/products">
                <span>COLLECTION</span>
                <strong>
                  {loading ? '…' : (summary?.productCount ?? '—')}
                </strong>
                <small>
                  items saved <ArrowUpRight size={13} />
                </small>
              </Link>
              <Link to="/documents">
                <span>DOCUMENTS</span>
                <strong>
                  {loading ? '…' : (summary?.documentCount ?? '—')}
                </strong>
                <small>
                  records kept <ArrowUpRight size={13} />
                </small>
              </Link>
              <Link to="/warranties">
                <span>WARRANTIES</span>
                <strong>
                  {loading ? '…' : (summary?.activeWarranties ?? '—')}
                </strong>
                <small>
                  currently active <ArrowUpRight size={13} />
                </small>
              </Link>
            </div>
            {summary?.recentProducts?.length > 0 && (
              <div className="overview-recent">
                <span className="landing-eyebrow">RECENTLY ADDED</span>
                <div>
                  {summary.recentProducts.slice(0, 3).map((item) => (
                    <Link key={item._id} to={`/products/${item._id}`}>
                      <span>{item.name}</span>
                      <small>
                        {item.brand || item.category || 'View item'}{' '}
                        <ArrowUpRight size={13} />
                      </small>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        <section className="landing-intro" id="collection">
          <div className="landing-section-title">
            <span className="landing-eyebrow">THE THINGS YOU KEEP</span>
            <h2>
              Your collection,
              <br />
              <em>all in one place.</em>
            </h2>
          </div>
          <div className="landing-intro-copy">
            <p>
              From the first-day purchase to the years of use that follow,
              LifeLedger keeps every useful detail close at hand.
            </p>
            <Link to={collectionHref} className="landing-inline-link">
              Make it yours <ArrowUpRight size={15} />
            </Link>
          </div>
        </section>

        <section
          className="landing-collection-grid"
          aria-label="A few things worth keeping track of"
        >
          <article className="landing-object-card landing-object-featured">
            <img
              src={photos.camera}
              alt="A camera carefully kept as part of a personal collection"
              loading="lazy"
            />
            <div className="landing-object-caption">
              <span>01 / KEEP WHAT MATTERS</span>
              <strong>Everyday essentials</strong>
            </div>
          </article>
          <article className="landing-object-card">
            <img
              src={photos.home}
              alt="A carefully kept, sunlit living room and home collection"
              loading="lazy"
            />
            <div className="landing-object-caption">
              <span>02 / KEEP THE HOME IN VIEW</span>
              <strong>Home, thoughtfully kept</strong>
            </div>
          </article>
          <div className="landing-object-aside">
            <span className="landing-eyebrow">A PERSONAL INVENTORY</span>
            <p>
              Serial numbers, purchase dates, notes, and value—organized without
              making life feel like paperwork.
            </p>
            <div className="landing-aside-mark">
              <Boxes size={21} />
              <span>YOURS, BY DESIGN</span>
            </div>
          </div>
        </section>

        <section className="landing-feature landing-documents" id="documents">
          <div className="landing-feature-image">
            <img
              src={photos.documents}
              alt="Receipts and papers organized beside a calculator and pen"
              loading="lazy"
            />
            <span>THE DETAILS, SAFELY KEPT</span>
          </div>
          <div className="landing-feature-copy">
            <span className="landing-eyebrow">02 — THE PAPERWORK</span>
            <h2>
              Receipts, manuals
              <br />
              and records, <em>together.</em>
            </h2>
            <p>
              Keep the documents that prove, explain, and support what you own.
              Link each file to its item and find it when it matters.
            </p>
            <ul>
              <li>
                <Check size={15} /> Private document storage
              </li>
              <li>
                <Check size={15} /> Receipts, manuals and invoices
              </li>
              <li>
                <Check size={15} /> Connected to the right item
              </li>
            </ul>
            <Link to={recordsHref} className="landing-inline-link">
              Keep your records close <ArrowUpRight size={15} />
            </Link>
          </div>
        </section>

        <section className="landing-protection" id="warranties">
          <div className="landing-protection-copy">
            <span className="landing-eyebrow">03 — PEACE OF MIND</span>
            <h2>
              Know what’s covered.
              <br />
              <em>Before you need it.</em>
            </h2>
            <p>
              Warranty terms are easy to forget. Keep providers, dates, and
              reference numbers together, then get a timely reminder before
              coverage ends.
            </p>
            <Link to={warrantyHref} className="landing-light-button">
              Keep an eye on every warranty <ArrowUpRight size={15} />
            </Link>
          </div>
          <div className="landing-protection-visual">
            <img
              src={photos.belongings}
              alt="Personal electronics and everyday valuables arranged together"
              loading="lazy"
            />
            <div className="protection-note">
              <ShieldCheck size={17} />
              <span>
                <strong>All in good hands</strong>
                <small>Your records stay private to you.</small>
              </span>
            </div>
          </div>
        </section>

        <section className="landing-care" id="care">
          <div className="landing-care-heading">
            <span className="landing-eyebrow">04 — MADE TO LAST</span>
            <h2>
              Good things deserve
              <br />a little <em>looking after.</em>
            </h2>
            <p>
              Build the habit of caring for what you own with a clear service
              history and gentle maintenance reminders.
            </p>
          </div>
          <div className="landing-care-steps">
            <article>
              <span>01</span>
              <Wrench size={19} />
              <h3>Log a repair</h3>
              <p>Keep service dates, costs, and notes beside the item.</p>
            </article>
            <article>
              <span>02</span>
              <FileText size={19} />
              <h3>Keep the history</h3>
              <p>Every service visit becomes part of its story.</p>
            </article>
            <article>
              <span>03</span>
              <Package size={19} />
              <h3>Plan the next one</h3>
              <p>Set a reminder for the care you don’t want to forget.</p>
            </article>
          </div>
        </section>

        <section className="landing-final-cta">
          <div>
            <span className="landing-eyebrow">A PLACE FOR WHAT YOU VALUE</span>
            <h2>
              Begin with what
              <br />
              you <em>already own.</em>
            </h2>
          </div>
          <Link to={startHref} className="landing-primary-button">
            {authenticated ? 'Add something to your collection' : 'Start your LifeLedger'} <ArrowUpRight size={15} />
          </Link>
        </section>
        <ContactSection />
      </main>
      <footer className="landing-footer">
        <div className="landing-footer-main">
          <div>
            <Brand to={authenticated ? '/dashboard' : '/'} />
            <p>A calmer way to keep the details of what you own.</p>
          </div>
          <div className="landing-footer-links">
            <span>EXPLORE</span>
            <a href="#collection">Your collection</a>
            <a href="#documents">Documents</a>
            <a href="#warranties">Warranties</a>
            <a href="#care">Care & repairs</a>
          </div>
          <div className="landing-footer-contact">
            <span>GET IN TOUCH</span>
            <a href={`mailto:${email}`}>
              {email} <ArrowUpRight size={13} />
            </a>
            <a href="#contact">Contact form</a>
          </div>
        </div>
        <div className="landing-footer-bottom">
          <span>
            © {new Date().getFullYear()} LIFELEDGER. MADE FOR THE THINGS THAT
            MATTER.
          </span>
          <span>
            Original LifeLedger illustrations
          </span>
          {authenticated && (
            <span className="landing-creator-credit">Built with love ❤️ by Rohan</span>
          )}
        </div>
      </footer>
    </>
  );
}

export default function LandingPage() {
  return (
    <div className="landing-site">
      <LandingHeader />
      <LandingContent />
    </div>
  );
}
