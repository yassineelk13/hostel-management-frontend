import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ScrollToTop from './components/common/ScrollToTop'; // ✅ IMPORT

// Layouts
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import AdminSidebar from './components/layout/AdminSidebar';

// Pages Client
import HomePage from './pages/client/HomePage';
import RoomsPage from './pages/client/RoomsPage';
import RoomDetailPage from './pages/client/RoomDetailPage';
import PacksPage from './pages/client/PacksPage';
import PackDetailPage from './pages/client/PackDetailPage';
import BookingPage from './pages/client/BookingPage';
import ContactPage from './pages/client/ContactPage';

// Pages Admin
import LoginPage from './pages/admin/LoginPage';
import ResetPasswordPage from './pages/admin/ResetPasswordPage';
import DashboardPage from './pages/admin/DashboardPage';
import RoomsManagementPage from './pages/admin/RoomsManagementPage';
import BookingsManagementPage from './pages/admin/BookingsManagementPage';
import ServicesManagementPage from './pages/admin/ServicesManagementPage';
import PacksManagementPage from './pages/admin/PacksManagementPage';
import SettingsPage from './pages/admin/SettingsPage';
import ChangePasswordPage from './pages/admin/ChangePasswordPage';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { token, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
      </div>
    );
  }
  
  return token ? children : <Navigate to="/admin/login" />;
};

// Client Layout
const ClientLayout = ({ children }) => (
  <div className="flex flex-col min-h-screen">
    <Navbar />
    <main className="flex-1">{children}</main>
    <Footer />
  </div>
);

// Admin Layout
const AdminLayout = ({ children }) => (
  <div className="flex min-h-screen bg-background">
    <AdminSidebar />
    <main className="flex-1 p-8">{children}</main>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop /> {/* ✅ AJOUTER ICI - Juste après Router */}
        
        <Routes>
          {/* ==================== ROUTES CLIENT ==================== */}
          <Route path="/" element={<ClientLayout><HomePage /></ClientLayout>} />
          <Route path="/rooms" element={<ClientLayout><RoomsPage /></ClientLayout>} />
          <Route path="/rooms/:id" element={<ClientLayout><RoomDetailPage /></ClientLayout>} />
          <Route path="/packs" element={<ClientLayout><PacksPage /></ClientLayout>} />
          <Route path="/packs/:id" element={<ClientLayout><PackDetailPage /></ClientLayout>} />
          <Route path="/booking" element={<ClientLayout><BookingPage /></ClientLayout>} />
          <Route path="/contact" element={<ClientLayout><ContactPage /></ClientLayout>} />

          {/* ==================== ROUTES ADMIN PUBLIQUES ==================== */}
          <Route path="/admin/login" element={<LoginPage />} />
          <Route path="/admin/reset-password" element={<ResetPasswordPage />} />
          <Route path="/admin/forgot-password" element={<Navigate to="/admin/reset-password" replace />} />

          {/* ==================== ROUTES ADMIN PROTÉGÉES ==================== */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <AdminLayout><DashboardPage /></AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/rooms"
            element={
              <ProtectedRoute>
                <AdminLayout><RoomsManagementPage /></AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/bookings"
            element={
              <ProtectedRoute>
                <AdminLayout><BookingsManagementPage /></AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/services"
            element={
              <ProtectedRoute>
                <AdminLayout><ServicesManagementPage /></AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/packs"
            element={
              <ProtectedRoute>
                <AdminLayout><PacksManagementPage /></AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute>
                <AdminLayout><SettingsPage /></AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/change-password"
            element={
              <ProtectedRoute>
                <AdminLayout><ChangePasswordPage /></AdminLayout>
              </ProtectedRoute>
            }
          />

          {/* ==================== REDIRECT 404 ==================== */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
