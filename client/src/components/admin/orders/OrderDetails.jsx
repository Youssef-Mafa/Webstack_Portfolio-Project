import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { format } from 'date-fns';
import axiosInstance from '../../../utils/axios';

const OrderDetails = ({ order, onClose }) => {
  const [orderWithDetails, setOrderWithDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setIsLoading(true);
        
        // Fetch both product and user details in parallel
        const [itemsWithProducts, userResponse] = await Promise.all([
          Promise.all(
            order.items.map(async (item) => {
              try {
                const response = await axiosInstance.get(`/products/${item.product_id}`);
                // Find the specific variant
                const variant = response.data.variants.find(v => v.sku === item.variant_id);
                return {
                  ...item,
                  product: response.data,
                  variant
                };
              } catch (error) {
                console.error(`Error fetching product ${item.product_id}:`, error);
                return {
                  ...item,
                  product: { name: 'Product not found' },
                  variant: null
                };
              }
            })
          ),
          axiosInstance.get(`/users/profile/${order.user_id}`)
        ]);

        setOrderWithDetails({
          ...order,
          items: itemsWithProducts,
          user: userResponse.data
        });
      } catch (error) {
        console.error('Error fetching details:', error);
        // If user fetch fails, still show order with available data
        setOrderWithDetails({
          ...order,
          items: await Promise.all(
            order.items.map(async (item) => {
              try {
                const response = await axiosInstance.get(`/products/${item.product_id}`);
                const variant = response.data.variants.find(v => v.sku === item.variant_id);
                return {
                  ...item,
                  product: response.data,
                  variant
                };
            } catch (error) {
                console.error(`Error fetching product details:`, error);
                return {
                  ...item,
                  product: { name: 'Product not found' },
                  variant: null
                };
              }
            })
          ),
          user: { username: 'User not found', email: 'N/A', full_name: 'N/A' }
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [order]);

  const formatDate = (date) => {
    return format(new Date(date), 'PPP');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusColor = (status) => {
    const colors = {
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Processing': 'bg-blue-100 text-blue-800',
      'Shipped': 'bg-purple-100 text-purple-800',
      'Delivered': 'bg-green-100 text-green-800',
      'Cancelled': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading || !orderWithDetails) {
    return (
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  const calculateSubtotal = () => {
    return orderWithDetails.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Order Details</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <span className="sr-only">Close</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Order Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Order Information</h3>
              <dl className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Order ID:</dt>
                  <dd className="text-gray-900">{orderWithDetails._id}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Date Placed:</dt>
                  <dd className="text-gray-900">{formatDate(orderWithDetails.createdAt)}</dd>
                </div>
                <div className="flex justify-between items-center">
                  <dt className="text-gray-500">Status:</dt>
                  <dd>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(orderWithDetails.status)}`}>
                      {orderWithDetails.status}
                    </span>
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Payment Method:</dt>
                  <dd className="text-gray-900">{orderWithDetails.payment.method}</dd>
                </div>
              </dl>
            </div>

            {/* Customer Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Customer Information</h3>
              <dl className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Name:</dt>
                  <dd className="text-gray-900">{orderWithDetails.user?.full_name || 'N/A'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Username:</dt>
                  <dd className="text-gray-900">{orderWithDetails.user?.username || 'N/A'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Email:</dt>
                  <dd className="text-gray-900">{orderWithDetails.user?.email || 'N/A'}</dd>
                </div>
                <div className="mt-2">
                  <dt className="text-gray-500">Shipping Address:</dt>
                  <dd className="text-gray-900 mt-1">
                    {orderWithDetails.shipping_address.address}<br />
                    {orderWithDetails.shipping_address.city}, {orderWithDetails.shipping_address.zip_code}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Order Items */}
          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Order Items</h3>
            <div className="border rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Variant</th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Quantity</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Price</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orderWithDetails.items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <img
                              className="h-10 w-10 rounded-lg object-cover"
                              src={item.product.images?.[0]?.url || '/placeholder.jpg'}
                              alt={item.product.name}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {item.product.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {item.variant ? (
                            <>
                              <span className="font-medium">Size:</span> {item.variant.size}<br />
                              <span className="font-medium">Color:</span> {item.variant.color}
                            </>
                          ) : 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-gray-900">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 text-right text-sm text-gray-900">
                        {formatCurrency(item.price)}
                      </td>
                      <td className="px-6 py-4 text-right text-sm text-gray-900">
                        {formatCurrency(item.price * item.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Order Summary */}
          <div className="mt-8">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h3>
              <dl className="space-y-2">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Subtotal:</dt>
                  <dd className="text-gray-900">{formatCurrency(calculateSubtotal())}</dd>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
                  <dt className="text-lg font-medium text-gray-900">Total:</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {formatCurrency(orderWithDetails.payment.amount)}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

OrderDetails.propTypes = {
  order: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    user_id: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    items: PropTypes.arrayOf(
      PropTypes.shape({
        product_id: PropTypes.string.isRequired,
        variant_id: PropTypes.string.isRequired,
        quantity: PropTypes.number.isRequired,
        price: PropTypes.number.isRequired
      })
    ).isRequired,
    shipping_address: PropTypes.shape({
      address: PropTypes.string.isRequired,
      city: PropTypes.string.isRequired,
      zip_code: PropTypes.string.isRequired
    }).isRequired,
    payment: PropTypes.shape({
      method: PropTypes.string.isRequired,
      amount: PropTypes.number.isRequired
    }).isRequired,
    createdAt: PropTypes.string.isRequired
  }).isRequired,
  onClose: PropTypes.func.isRequired
};

export default OrderDetails;