import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout.jsx';
import AuthPage from '../features/auth/pages/AuthPage.jsx';
import DashboardPage from '../features/dashboard/pages/DashboardPage.jsx';
import CollectionPage from '../features/products/pages/CollectionPage.jsx';
import ProductFormPage from '../features/products/pages/ProductFormPage.jsx';
import ProductDetailPage from '../features/products/pages/ProductDetailPage.jsx';
import WarrantyPage from '../features/warranties/pages/WarrantyPage.jsx';
import CarePage from '../features/care/pages/CarePage.jsx';
import NotificationsPage from '../features/notifications/pages/NotificationsPage.jsx';
import LandingPage from '../features/landing/pages/LandingPage.jsx';
import TimelinePage from '../features/timeline/TimelinePage.jsx';
import FamilyPage from '../features/family/FamilyPage.jsx';
import ProfilePage from '../features/profile/ProfilePage.jsx';
import { useAuth } from './providers.jsx';

const DocumentsPage = lazy(() => import('../features/documents/pages/DocumentsPage.jsx'));
const AssetsPage = lazy(() => import('../features/assets/AssetsPage.jsx'));

export default function App() {
  const { user, loading, sessionError, retrySessionRestore } = useAuth();

  if (loading) {
    return (
      <main className="session-loading" role="status" aria-live="polite">
        Restoring your LifeLedger session…
      </main>
    );
  }

  if (sessionError) {
    return (
      <main className="session-loading" role="alert">
        <h1>We couldn’t restore your session.</h1>
        <p>Check your connection and try again. Your account data is still safe.</p>
        <button className="primary-button" onClick={() => retrySessionRestore().catch(() => {})}>
          Try again
        </button>
      </main>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/login"
        element={user ? <Navigate to="/dashboard" replace /> : <AuthPage mode="login" />}
      />
      <Route
        path="/register"
        element={user ? <Navigate to="/dashboard" replace /> : <AuthPage mode="register" />}
      />
      <Route element={user ? <AppLayout /> : <Navigate to="/login" replace />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/products" element={<CollectionPage />} />
        <Route path="/products/new" element={<ProductFormPage />} />
        <Route path="/products/:productId/edit" element={<ProductFormPage />} />
        <Route path="/products/:productId" element={<ProductDetailPage />} />
        <Route path="/warranties" element={<WarrantyPage />} />
        <Route path="/documents" element={<Suspense fallback={<main className="main-content"><p>Opening your documents…</p></main>}><DocumentsPage /></Suspense>} />
        <Route path="/care" element={<CarePage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/timeline" element={<TimelinePage />} />
        <Route path="/assets" element={<Suspense fallback={<main className="main-content"><p>Opening your asset register…</p></main>}><AssetsPage /></Suspense>} />
        <Route path="/family" element={<FamilyPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>
      <Route
        path="*"
        element={<Navigate to={user ? '/dashboard' : '/'} replace />}
      />
    </Routes>
  );
}
