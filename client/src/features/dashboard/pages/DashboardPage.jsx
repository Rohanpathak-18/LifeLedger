import { useEffect, useState } from 'react';
import { LandingContent } from '../../landing/pages/LandingPage.jsx';
import { dashboardService } from '../dashboard.service.js';

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    dashboardService
      .summary()
      .then((result) => {
        if (active) setSummary(result);
      })
      .catch(() => {
        if (active) setSummary(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="landing-site overview-site">
      <LandingContent authenticated summary={summary} loading={loading} />
    </div>
  );
}
