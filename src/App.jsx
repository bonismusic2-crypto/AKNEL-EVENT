import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ScrollToTop from './components/ui/ScrollToTop'; // We will create this helper
import Home from './pages/Home';
import Venue from './pages/Venue';
import Events from './pages/Events';
import MusicStore from './pages/MusicStore';
import Contact from './pages/Contact';
import Auth from './pages/Auth';
import Profile from './pages/Profile';

// Simple ScrollToTop component inline for now or can be separate
const ScrollToTopHelper = () => {
  // Logic to scroll to top on route change would go here if specialized, 
  // but we can just make a dedicated component.
  // For now, let's just make sure the router is set up.
  return null;
}

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/venue" element={<Venue />} />
        <Route path="/events" element={<Events />} />
        <Route path="/musique" element={<MusicStore />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Router>
  );
}

export default App;
