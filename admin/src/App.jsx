import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminLayout from './components/layout/AdminLayout';
import DashboardHome from './pages/DashboardHome';
import Messages from './pages/Messages';
import Reservations from './pages/Reservations';
import EditHome from './pages/EditHome';
import EditAbout from './pages/EditAbout';
import EditServices from './pages/EditServices';
import EditGallery from './pages/EditGallery';
import EditContact from './pages/EditContact';
import Login from './pages/Login';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        {/* Login Route - Public */}
        <Route path="/login" element={<Login />} />

        {/* Protected Admin Routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<DashboardHome />} />
          <Route path="messages" element={<Messages />} />
          <Route path="reservations" element={<Reservations />} />
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
