import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout.jsx';
import AuthPage from '../features/auth/pages/AuthPage.jsx';
import DashboardPage from '../features/dashboard/pages/DashboardPage.jsx';
import CollectionPage from '../features/products/pages/CollectionPage.jsx';
import ProductFormPage from '../features/products/pages/ProductFormPage.jsx';
import ProductDetailPage from '../features/products/pages/ProductDetailPage.jsx';
import WarrantyPage from '../features/warranties/pages/WarrantyPage.jsx';
import DocumentsPage from '../features/documents/pages/DocumentsPage.jsx';
import CarePage from '../features/care/pages/CarePage.jsx';
import NotificationsPage from '../features/notifications/pages/NotificationsPage.jsx';
import LandingPage from '../features/landing/pages/LandingPage.jsx';
import { useAuth } from './providers.jsx';

export default function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<AuthPage mode="login" />} />
      <Route path="/register" element={<AuthPage mode="register" />} />
      <Route element={user ? <AppLayout /> : <Navigate to="/login" replace />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/products" element={<CollectionPage />} />
        <Route path="/products/new" element={<ProductFormPage />} />
        <Route path="/products/:productId/edit" element={<ProductFormPage />} />
        <Route path="/products/:productId" element={<ProductDetailPage />} />
        <Route path="/warranties" element={<WarrantyPage />} />
        <Route path="/documents" element={<DocumentsPage />} />
        <Route path="/care" element={<CarePage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
      </Route>
      <Route
        path="*"
        element={<Navigate to={user ? '/dashboard' : '/'} replace />}
      />
    </Routes>
  );
}
