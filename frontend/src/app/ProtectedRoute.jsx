import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute() {
  const { user } = useAuth();

  // 🔥 wait for user
  if (user === null) return null;

  return user ? <Outlet /> : <Navigate to="/login" />;
}

export default ProtectedRoute;