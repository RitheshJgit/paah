import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';


function AdminRoute() {
  const { user } = useAuth();

  if (!user) return null;

  return user.role === 'admin'
    ? <Outlet />
    : <Navigate to="/" />;
}

export default AdminRoute;