import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AdminDashboard from './AdminDashboard';
import BuyerDashboard from './BuyerDashboard';
import Profile from './Profile';

export default function RoleDashboard() {
  const { currentUser, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (currentUser?.role === 'admin') return <AdminDashboard />;
  if (currentUser?.role === 'agent') return <Profile />;
  return <BuyerDashboard />;
}