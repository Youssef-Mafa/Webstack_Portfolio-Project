import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../features/auth/authSlice';
import { getCart } from '../../features/cart/cartSlice';
import { ShoppingCart, Menu, X, User, LogOut, Package, Settings } from 'lucide-react';

const Header = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const cartDropdownRef = useRef(null);
    const profileDropdownRef = useRef(null);
    
    const { user } = useSelector((state) => state.auth);
    const { items } = useSelector((state) => state.cart);

    useEffect(() => {
        if (user) {
            dispatch(getCart());
        }
    }, [dispatch, user]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (cartDropdownRef.current && !cartDropdownRef.current.contains(event.target)) {
                setIsCartOpen(false);
            }
            if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
                setIsProfileMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location]);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/');
    };

    const calculateTotal = () => {
        return items.reduce((total, item) => {
            return total + (item.productDetails.price * item.quantity);
        }, 0).toFixed(2);
    };

    const getTotalItems = () => {
        return items.reduce((total, item) => total + item.quantity, 0);
    };

    const navigation = [
        { name: 'Home', href: '/' },
        { name: 'Products', href: '/products' },
    ];

    return (
        <header className="bg-white shadow-md">
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Logo and Navigation */}
                    <div className="flex items-center">
                        <Link to="/" className="flex-shrink-0 flex items-center">
                            <span className="text-xl font-bold text-indigo-600">E-Shop</span>
                        </Link>
                        <div className="hidden md:ml-6 md:flex md:space-x-8">
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                                        location.pathname === item.href
                                            ? 'text-indigo-600 border-b-2 border-indigo-600'
                                            : 'text-gray-500 hover:text-gray-900 hover:border-gray-300'
                                    }`}
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                        >
                            {isMobileMenuOpen ? (
                                <X className="block h-6 w-6" />
                            ) : (
                                <Menu className="block h-6 w-6" />
                            )}
                        </button>
                    </div>

                    {/* Desktop right navigation */}
                    <div className="hidden md:flex md:items-center md:space-x-4">
                        {user && (
                            <div className="relative" ref={cartDropdownRef}>
                                <button
                                    className="relative p-2 text-gray-700 hover:text-gray-900"
                                    onClick={() => setIsCartOpen(!isCartOpen)}
                                >
                                    <ShoppingCart className="h-6 w-6" />
                                    {items.length > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                            {getTotalItems()}
                                        </span>
                                    )}
                                </button>

                                {/* Cart Dropdown */}
                                {isCartOpen && (
                                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-50">
                                        <div className="p-4">
                                            <h3 className="text-lg font-semibold mb-4">Shopping Cart</h3>
                                            {items.length === 0 ? (
                                                <p className="text-gray-500">Your cart is empty</p>
                                            ) : (
                                                <>
                                                    <div className="max-h-60 overflow-y-auto">
                                                        {items.map((item) => (
                                                            <div
                                                                key={`${item.product_id}-${item.variant_id}`}
                                                                className="flex items-center gap-2 py-2 border-b"
                                                            >
                                                                <img
                                                                    src={item.productDetails.images[0]?.url || '/placeholder.jpg'}
                                                                    alt={item.productDetails.name}
                                                                    className="w-12 h-12 object-cover rounded"
                                                                />
                                                                <div className="flex-1">
                                                                    <h4 className="text-sm font-medium">{item.productDetails.name}</h4>
                                                                    <p className="text-sm text-gray-500">
                                                                        Qty: {item.quantity} × ${item.productDetails.price}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div className="mt-4 pt-4 border-t">
                                                        <div className="flex justify-between font-semibold">
                                                            <span>Total:</span>
                                                            <span>${calculateTotal()}</span>
                                                        </div>
                                                        <div className="mt-4 space-y-2">
                                                            <button
                                                                onClick={() => {
                                                                    navigate('/cart');
                                                                    setIsCartOpen(false);
                                                                }}
                                                                className="w-full bg-gray-100 text-gray-800 py-2 px-4 rounded hover:bg-gray-200"
                                                            >
                                                                View Cart
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    navigate('/checkout');
                                                                    setIsCartOpen(false);
                                                                }}
                                                                className="w-full bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700"
                                                            >
                                                                Checkout
                                                            </button>
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {user ? (
                            <div className="relative" ref={profileDropdownRef}>
                                <button
                                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                                    className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
                                >
                                    <User className="h-5 w-5" />
                                    <span className="text-sm font-medium">{user.username}</span>
                                </button>

                                {isProfileMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50">
                                        <div className="py-1">
                                            {user.roles.includes('admin') && (
                                                <Link
                                                    to="/admin"
                                                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                    onClick={() => setIsProfileMenuOpen(false)}
                                                >
                                                    <Settings className="h-4 w-4 mr-2" />
                                                    Admin Dashboard
                                                </Link>
                                            )}
                                            <Link
                                                to="/profile"
                                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                onClick={() => setIsProfileMenuOpen(false)}
                                            >
                                                <User className="h-4 w-4 mr-2" />
                                                Profile
                                            </Link>
                                            <Link
                                                to="/profile"
                                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                onClick={() => setIsProfileMenuOpen(false)}
                                            >
                                                <Package className="h-4 w-4 mr-2" />
                                                Orders
                                            </Link>
                                            <button
                                                onClick={() => {
                                                    handleLogout();
                                                    setIsProfileMenuOpen(false);
                                                }}
                                                className="flex w-full items-center px-4 py-2 text-sm text-red-700 hover:bg-gray-100"
                                            >
                                                <LogOut className="h-4 w-4 mr-2" />
                                                Logout
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center space-x-4">
                                <Link
                                    to="/login"
                                    className="text-gray-700 hover:text-gray-900 text-sm font-medium"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
                                >
                                    Register
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Mobile menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden">
                        <div className="pt-2 pb-3 space-y-1">
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    className={`block px-3 py-2 rounded-md text-base font-medium ${
                                        location.pathname === item.href
                                            ? 'bg-indigo-50 text-indigo-600'
                                            : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                                >
                                    {item.name}
                                </Link>
                            ))}
                            {user ? (
                                <>
                                    <Link
                                        to="/profile"
                                        className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
                                    >
                                        Profile
                                    </Link>
                                    <Link
                                        to="/profile"
                                        className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
                                    >
                                        Orders
                                    </Link>
                                    <Link
                                        to="/cart"
                                        className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
                                    >
                                        Cart ({getTotalItems()})
                                    </Link>
                                    {user.roles.includes('admin') && (
                                        <Link
                                            to="/admin"
                                            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
                                        >
                                            Admin Dashboard
                                        </Link>
                                    )}
                                    <button
                                        onClick={handleLogout}
                                        className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-700 hover:bg-gray-50"
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <div className="px-3 py-2 space-y-1">
                                    <Link
                                        to="/login"
                                        className="block rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="block rounded-md text-base font-medium text-indigo-600 hover:bg-gray-50"
                                    >
                                        Register
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </nav>
        </header>
    );
};

export default Header;