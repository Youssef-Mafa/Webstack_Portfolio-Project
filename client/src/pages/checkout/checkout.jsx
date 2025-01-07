import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { clearCart } from '../../features/cart/cartSlice';
import axiosInstance from '../../utils/axios';

const Checkout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    shipping_address: {
      address: '',
      city: '',
      zip_code: ''
    },
    payment: {
      method: 'Credit Card',
      // In a real app, you'd want to integrate with a payment processor
      // and handle card details securely
      card_number: '',
      expiry: '',
      cvv: ''
    }
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
    if (!items.length) {
      navigate('/cart');
    }
  }, [user, items, navigate]);

  const calculateSubtotal = () => {
    return items.reduce((total, item) => {
      return total + (item.productDetails.price * item.quantity);
    }, 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.1; // 10% tax
  };

  const calculateShipping = () => {
    return calculateSubtotal() > 100 ? 0 : 10; // Free shipping over $100
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax() + calculateShipping();
  };

  const handleInputChange = (e, section) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [name]: value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
  
    try {
      // Create the order
      const response = await axiosInstance.post('/orders/create', {
        shipping_address: formData.shipping_address,
        payment: {
          method: formData.payment.method,
          amount: calculateTotal(),
          transaction_id: `TXN_${Date.now()}`
        }
      });
  
      // Clear the cart after successful order
      dispatch(clearCart());
  
      // Navigate to thank you page with order details
      navigate('/thank-you', {
        state: {
          orderDetails: {
            orderId: response.data.order._id,
            total: calculateTotal(),
            shippingAddress: formData.shipping_address,
            items: items,
            paymentMethod: formData.payment.method
          }
        }
      });
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create order');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Checkout Form */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-semibold mb-6">Checkout</h2>
          <form onSubmit={handleSubmit}>
            {/* Shipping Information */}
            <div className="mb-8">
              <h3 className="text-lg font-medium mb-4">Shipping Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    required
                    value={formData.shipping_address.address}
                    onChange={(e) => handleInputChange(e, 'shipping_address')}
                    className="w-full p-2 border rounded focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    required
                    value={formData.shipping_address.city}
                    onChange={(e) => handleInputChange(e, 'shipping_address')}
                    className="w-full p-2 border rounded focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    name="zip_code"
                    required
                    value={formData.shipping_address.zip_code}
                    onChange={(e) => handleInputChange(e, 'shipping_address')}
                    className="w-full p-2 border rounded focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="mb-8">
              <h3 className="text-lg font-medium mb-4">Payment Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Method
                  </label>
                  <select
                    name="method"
                    value={formData.payment.method}
                    onChange={(e) => handleInputChange(e, 'payment')}
                    className="w-full p-2 border rounded focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="Credit Card">Credit Card</option>
                    <option value="PayPal">PayPal</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                  </select>
                </div>

                {formData.payment.method === 'Credit Card' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Card Number
                      </label>
                      <input
                        type="text"
                        name="card_number"
                        required
                        value={formData.payment.card_number}
                        onChange={(e) => handleInputChange(e, 'payment')}
                        className="w-full p-2 border rounded focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Expiry Date
                        </label>
                        <input
                          type="text"
                          name="expiry"
                          placeholder="MM/YY"
                          required
                          value={formData.payment.expiry}
                          onChange={(e) => handleInputChange(e, 'payment')}
                          className="w-full p-2 border rounded focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          CVV
                        </label>
                        <input
                          type="text"
                          name="cvv"
                          required
                          value={formData.payment.cvv}
                          onChange={(e) => handleInputChange(e, 'payment')}
                          className="w-full p-2 border rounded focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Processing...' : 'Place Order'}
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div className="bg-gray-50 p-6 rounded-lg shadow">
          <h2 className="text-2xl font-semibold mb-6">Order Summary</h2>
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={`${item.product_id}-${item.variant_id}`}
                className="flex justify-between items-center py-2 border-b"
              >
                <div className="flex items-center space-x-4">
                  <img
                    src={item.productDetails.images?.[0]?.url || '/placeholder.jpg'}
                    alt={item.productDetails.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div>
                    <h3 className="font-medium">{item.productDetails.name}</h3>
                    <p className="text-sm text-gray-500">
                      Quantity: {item.quantity}
                    </p>
                  </div>
                </div>
                <span className="font-medium">
                  ${(item.productDetails.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}

            <div className="pt-4 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${calculateSubtotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (10%)</span>
                <span>${calculateTax().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>
                  {calculateShipping() === 0
                    ? 'Free'
                    : `$${calculateShipping().toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>Total</span>
                <span>${calculateTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;