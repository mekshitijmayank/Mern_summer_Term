import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { FavoritesProvider } from './context/FavoritesContext';
import Layout from './components/layout/Layout';
import GharFindHome from './pages/GharFindHome';
import Listings from './pages/Listings';
import PropertyDetail from './pages/PropertyDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Contact from './pages/Contact';
import Favorites from './pages/Favorites';
import Profile from './pages/Profile';
import RoleDashboard from './pages/RoleDashboard';
import ScrollToTop from './components/common/ScrollToTop';

import Agents from './pages/Agents';

export default function App() {
  return (
    <AuthProvider>
      <FavoritesProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            {/* Standalone Auth Routes (without shared Header/Footer Layout) */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Main Layout Routes with Navbar and Footer */}
            <Route path="/" element={<Layout />}>
              <Route index element={<GharFindHome />} />
              <Route path="listings" element={<Listings />} />
              <Route path="agents" element={<Agents />} />
              <Route path="properties/:id" element={<PropertyDetail />} />
              <Route path="property/:id" element={<PropertyDetail />} />
              <Route path="favorites" element={<Favorites />} />
              <Route path="dashboard" element={<RoleDashboard />} />
              <Route path="profile" element={<Profile />} />
              <Route path="contact" element={<Contact />} />
              {/* Catch-all route */}
              <Route path="*" element={<GharFindHome />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </FavoritesProvider>
    </AuthProvider>
  );
}

