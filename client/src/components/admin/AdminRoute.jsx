import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

const AdminRoute = () => {
  const { user } = useSelector((state) => state.auth);

  if (!user || !user.roles.includes('admin')) {
    return <Navigate to="/login" />;
  }

  return <Outlet />;
};

export default AdminRoute;