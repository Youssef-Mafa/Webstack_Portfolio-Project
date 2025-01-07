import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    getCart,
    updateCartItem,
    removeFromCart,
    clearCart
} from '../../features/cart/cartSlice';

const Cart = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { items, isLoading } = useSelector((state) => state.cart);
    const { user } = useSelector((state) => state.auth);

    useEffect(() => {
        if (user) {
            dispatch(getCart());
        }
    }, [dispatch, user]);

    const handleQuantityChange = (product_id, variant_id, quantity) => {
        dispatch(updateCartItem({ product_id, variant_id, quantity }));
    };

    const handleRemoveItem = (product_id, variant_id) => {
        dispatch(removeFromCart({ product_id, variant_id }));
    };

    const handleClearCart = () => {
        dispatch(clearCart());
    };

    const calculateItemTotal = (price, quantity) => {
        return (price * quantity).toFixed(2);
    };

    const calculateTotal = () => {
        return items.reduce((total, item) => {
            return total + (item.productDetails?.price * item.quantity);
        }, 0).toFixed(2);
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!items?.length) {
        return (
            <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Your cart is empty</h2>
                <button
                    className="text-indigo-600 hover:text-indigo-800"
                    onClick={() => navigate('/products')}
                >
                    Continue Shopping
                </button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-8">Shopping Cart</h1>
            
            <div className="flex flex-col lg:flex-row gap-8">
                {/* Cart Items */}
                <div className="lg:w-2/3">
                    {/* Table Header */}
                    <div className="hidden md:grid grid-cols-6 gap-4 py-2 bg-gray-50 rounded-t px-4">
                        <div className="col-span-2">Product</div>
                        <div>Price</div>
                        <div>Quantity</div>
                        <div>Total</div>
                        <div>Action</div>
                    </div>

                    {/* Cart Items */}
                    {items.map((item) => (
                        item.productDetails && (
                            <div
                                key={`${item.product_id}-${item.variant_id}`}
                                className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center border-b py-4 px-4"
                            >
                                {/* Product Info */}
                                <div className="col-span-2 flex items-center gap-4">
                                    <img
                                        src={item.productDetails.images?.[0]?.url || '/placeholder.jpg'}
                                        alt={item.productDetails.name}
                                        className="w-24 h-24 object-cover rounded"
                                    />
                                    <div>
                                        <h3 className="font-semibold">
                                            {item.productDetails.name}
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            Variant: {item.variant_id}
                                        </p>
                                    </div>
                                </div>

                                {/* Price */}
                                <div className="text-gray-900">
                                    ${item.productDetails.price}
                                </div>

                                {/* Quantity */}
                                <div className="flex items-center space-x-2">
                                    <button
                                        className="px-2 py-1 border rounded-l hover:bg-gray-100"
                                        onClick={() => handleQuantityChange(
                                            item.product_id,
                                            item.variant_id,
                                            Math.max(1, item.quantity - 1)
                                        )}
                                    >
                                        -
                                    </button>
                                    <input
                                        type="number"
                                        min="1"
                                        value={item.quantity}
                                        onChange={(e) => handleQuantityChange(
                                            item.product_id,
                                            item.variant_id,
                                            parseInt(e.target.value) || 1
                                        )}
                                        className="w-16 px-2 py-1 border text-center"
                                    />
                                    <button
                                        className="px-2 py-1 border rounded-r hover:bg-gray-100"
                                        onClick={() => handleQuantityChange(
                                            item.product_id,
                                            item.variant_id,
                                            item.quantity + 1
                                        )}
                                    >
                                        +
                                    </button>
                                </div>

                                {/* Item Total */}
                                <div className="font-semibold text-gray-900">
                                    ${calculateItemTotal(item.productDetails.price, item.quantity)}
                                </div>

                                {/* Remove Button */}
                                <div>
                                    <button
                                        onClick={() => handleRemoveItem(item.product_id, item.variant_id)}
                                        className="text-red-600 hover:text-red-800"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        )
                    ))}
                    
                    <div className="mt-4">
                        <button
                            onClick={handleClearCart}
                            className="text-red-600 hover:text-red-800"
                        >
                            Clear Cart
                        </button>
                    </div>
                </div>

                {/* Cart Summary */}
                <div className="lg:w-1/3">
                    <div className="bg-gray-50 rounded-lg p-6 sticky top-4">
                        <h2 className="text-xl font-bold mb-6">Order Summary</h2>
                        
                        <div className="mb-6">
                            <div className="flex justify-between font-bold text-lg">
                                <span>Total</span>
                                <span>${calculateTotal()}</span>
                            </div>
                        </div>

                        <button
                            onClick={() => navigate('/checkout')}
                            className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            Proceed to Checkout
                        </button>

                        <button
                            onClick={() => navigate('/products')}
                            className="w-full mt-4 text-indigo-600 hover:text-indigo-800"
                        >
                            Continue Shopping
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;