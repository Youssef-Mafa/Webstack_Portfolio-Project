import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../features/auth/authSlice';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react';

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useSelector((state) => state.auth);

  const navigation = [
    { 
      name: 'Dashboard', 
      href: '/admin', 
      icon: LayoutDashboard 
    },
    { 
      name: 'Products', 
      href: '/admin/products', 
      icon: Package 
    },
    { 
      name: 'Orders', 
      href: '/admin/orders', 
      icon: ShoppingCart 
    },
    { 
      name: 'Categories', 
      href: '/admin/categories', 
      icon: Settings 
    }
  ];

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r transform transition-transform duration-200 ease-in-out ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between h-16 px-4 border-b">
            <h1 className="text-xl font-semibold">Admin Panel</h1>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden p-2 rounded-md text-gray-500 hover:bg-gray-100"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-2 py-4 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-4 py-2 text-sm rounded-lg ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User Profile & Logout */}
          <div className="border-t p-4">
            <div className="flex items-center mb-4">
              <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                {user?.username?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{user?.username || 'Admin'}</p>
                <p className="text-xs text-gray-500">{user?.email || 'admin@example.com'}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-sm text-red-600 rounded-lg hover:bg-red-50"
            >
              <LogOut className="h-5 w-5 mr-3" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Toggle */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b px-4 h-16 flex items-center">
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 rounded-md text-gray-500 hover:bg-gray-100"
        >
          <Menu className="h-6 w-6" />
        </button>
        <h1 className="ml-4 text-lg font-semibold">Admin Panel</h1>
      </div>

      {/* Main Content */}
      <main className="flex-1 min-w-0 overflow-auto">
        <div className="py-20 lg:py-8 px-4 lg:px-8">
          <Outlet />
        </div>
      </main>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminLayout;