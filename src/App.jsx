import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ScrollToTop from './components/ui/ScrollToTop';

// Pages Publiques
import Home from './pages/Home';
import Venue from './pages/Venue';
import Services from './pages/Services';
import Events from './pages/Events';
import Contact from './pages/Contact';
import Auth from './pages/Auth';
import Profile from './pages/Profile';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentCancel from './pages/PaymentCancel';

// Pages & Layout Administrateur
import AdminLayout from './components/admin-layout/AdminLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import Login from './admin-pages/Login';
import DashboardHome from './admin-pages/DashboardHome';
import Messages from './admin-pages/Messages';
import Reservations from './admin-pages/Reservations';
import ManageMusic from './admin-pages/ManageMusic';
import ManagePublicEvents from './admin-pages/ManagePublicEvents';
import EditHome from './admin-pages/EditHome';
import EditAbout from './admin-pages/EditAbout';
import EditServices from './admin-pages/EditServices';
import EditGallery from './admin-pages/EditGallery';
import EditContact from './admin-pages/EditContact';

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* ================= ROUTES PUBLIQUES ================= */}
        <Route path="/" element={<Home />} />
        <Route path="/venue" element={<Venue />} />
        <Route path="/services" element={<Services />} />
        <Route path="/events" element={<Events />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/profile" element={<Profile />} />

        {/* ================= PAGES PAIEMENT GENIUSPAY ================= */}
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/payment-cancel" element={<PaymentCancel />} />

        {/* ================= ROUTES ADMIN FUSIONNÉES ================= */}
        <Route path="/admin/login" element={<Login />} />
        
        {/* Redirection pratique /login -> /admin/login */}
        <Route path="/login" element={<Navigate to="/admin/login" replace />} />

        {/* Espace Admin Protégé sous /admin */}
        <Route path="/admin" element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<DashboardHome />} />
          <Route path="messages" element={<Messages />} />
          <Route path="reservations" element={<Reservations />} />
          <Route path="manage-music" element={<ManageMusic />} />
          <Route path="manage-events" element={<ManagePublicEvents />} />
          <Route path="edit-home" element={<EditHome />} />
          <Route path="edit-about" element={<EditAbout />} />
          <Route path="edit-services" element={<EditServices />} />
          <Route path="edit-gallery" element={<EditGallery />} />
          <Route path="edit-contact" element={<EditContact />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
