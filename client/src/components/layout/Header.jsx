import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../features/auth/authSlice';
import { getCart } from '../../features/cart/cartSlice';
import { ShoppingCart } from 'lucide-react';

const Header = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [isCartOpen, setIsCartOpen] = useState(false);
    const cartDropdownRef = useRef(null);
    
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
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        dispatch(logout());
    };

    const calculateTotal = () => {
        return items.reduce((total, item) => {
            return total + (item.productDetails.price * item.quantity);
        }, 0).toFixed(2);
    };

    const getTotalItems = () => {
        return items.reduce((total, item) => total + item.quantity, 0);
    };

    return (
        <header className="bg-white shadow">
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <Link to="/" className="flex-shrink-0 flex items-center">
                            <span className="text-xl font-bold">E-Commerce</span>
                        </Link>
                        <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                            <Link
                                to="/products"
                                className="text-gray-700 hover:text-gray-900 inline-flex items-center px-1 pt-1"
                            >
                                Products
                            </Link>
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
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
                                                                className="w-full bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700"
                                                            >
                                                                View Cart
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    navigate('/checkout');
                                                                    setIsCartOpen(false);
                                                                }}
                                                                className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
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
                            <div className="flex items-center space-x-4">
                                <span className="text-gray-700">
                                    Welcome, {user.username}
                                </span>
                                <Link 
                                    to="/profile"
                                    className="text-gray-700 hover:text-gray-900"
                                >
                                    Profile
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="bg-red-600 px-4 py-2 rounded text-white hover:bg-red-700"
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-4">
                                <Link
                                    to="/login"
                                    className="text-gray-700 hover:text-gray-900"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                                >
                                    Register
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </nav>
        </header>
    );
};

export default Header;