import { useEffect, useMemo, useState } from 'react';
import {
  ArrowUpRight,
  CalendarDays,
  ChartNoAxesColumnIncreasing,
  Clock3,
  History,
  ShieldCheck,
  Wrench,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { timelineService } from './timeline.service.js';

const icons = {
  activity: History,
  purchase: CalendarDays,
  value: ChartNoAxesColumnIncreasing,
  warranty: ShieldCheck,
  care: Wrench,
};
const day = (value) =>
  new Date(value).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

export default function TimelinePage() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  useEffect(() => {
    timelineService
      .list()
      .then(setItems)
      .catch(() =>
        setError('Your timeline could not be loaded. Please try again.'),
      );
  }, []);
  const groups = useMemo(() => {
    return [
      {
        title: 'Coming up',
        rows: items
          .filter((item) => item.upcoming)
          .sort((a, b) => new Date(a.date) - new Date(b.date)),
      },
      {
        title: 'Your history',
        rows: items
          .filter((item) => !item.upcoming)
          .sort((a, b) => new Date(b.date) - new Date(a.date)),
      },
    ].filter((group) => group.rows.length);
  }, [items]);
  return (
    <main className="main-content timeline-page">
      <div className="collection-page-heading">
        <div>
          <span className="section-kicker">THE STORY OF WHAT YOU KEEP</span>
          <h1>
            Life, in <em>sequence.</em>
          </h1>
          <p>Purchases, care, coverage, and records in one calm view.</p>
        </div>
      </div>
      {error && (
        <div className="inline-error" role="alert">
          {error}
        </div>
      )}
      {!error && groups.length === 0 && (
        <div className="inventory-empty">
          <span className="dashboard-empty-icon">
            <Clock3 size={22} />
          </span>
          <h2>Your timeline starts here</h2>
          <p>
            Add an item, record a warranty, or plan a little care to bring your
            history together.
          </p>
          <Link className="primary-button" to="/products/new">
            Add an item <ArrowUpRight size={14} />
          </Link>
        </div>
      )}
      {groups.map((group) => (
        <section className="timeline-group" key={group.title}>
          <div className="section-heading">
            <div>
              <span className="section-kicker">
                {group.title === 'Coming up'
                  ? 'DATES TO KEEP IN VIEW'
                  : 'A RECORD OF YOUR COLLECTION'}
              </span>
              <h2>{group.title}</h2>
            </div>
          </div>
          <div className="timeline-list">
            {group.rows.map((item) => {
              const Icon = icons[item.type] || History;
              return (
                <Link
                  className="timeline-row"
                  to={item.href || '/notifications'}
                  key={item.id}
                >
                  <span className={`timeline-icon timeline-${item.type}`}>
                    <Icon size={17} />
                  </span>
                  <span className="timeline-copy">
                    <strong>{item.title}</strong>
                    <small>{item.detail}</small>
                  </span>
                  <time dateTime={new Date(item.date).toISOString()}>
                    {day(item.date)}
                  </time>
                  <ArrowUpRight size={15} />
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </main>
  );
}
