import { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axios';
import { format } from 'date-fns';

const OrderHistory = () => {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await axiosInstance.get('/orders/user-orders');
            // Fetch product details for each order item
            const ordersWithProducts = await Promise.all(
                response.data.orders.map(async (order) => {
                    const itemsWithProducts = await Promise.all(
                        order.items.map(async (item) => {
                            try {
                                const productResponse = await axiosInstance.get(`/products/${item.product_id}`);
                                return {
                                    ...item,
                                    productDetails: productResponse.data
                                };
                            } catch (error) {
                                console.error(`Error fetching product ${item.product_id}:`, error);
                                return {
                                    ...item,
                                    productDetails: { name: 'Product not found' }
                                };
                            }
                        })
                    );
                    return {
                        ...order,
                        items: itemsWithProducts
                    };
                })
            );
            setOrders(ordersWithProducts);
            setError(null);
        } catch (err) {
            setError('Failed to fetch orders');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return format(new Date(dateString), 'PPP');
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

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-red-600 text-center py-8">
                {error}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Order History</h2>

            {orders.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No orders found</p>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <div 
                            key={order._id} 
                            className="bg-white rounded-lg shadow overflow-hidden"
                        >
                            {/* Order Header */}
                            <div className="p-4 border-b bg-gray-50">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-sm text-gray-600">
                                            Order ID: {order._id}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            Placed on: {formatDate(order.createdAt)}
                                        </p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                        {order.status}
                                    </span>
                                </div>
                            </div>

                            {/* Order Items */}
                            <div className="p-4">
                                {order.items.map((item, index) => (
                                    <div 
                                        key={`${item.product_id}-${index}`}
                                        className="flex items-center py-2"
                                    >
                                        <div className="flex-1">
                                            <h4 className="text-sm font-medium text-gray-900">
                                                {item.productDetails.name}
                                            </h4>
                                            <p className="text-sm text-gray-500">
                                                Qty: {item.quantity}
                                            </p>
                                        </div>
                                        <p className="text-sm font-medium text-gray-900">
                                            ${item.price.toFixed(2)}
                                        </p>
                                    </div>
                                ))}

                                {/* Order Summary */}
                                <div className="mt-4 pt-4 border-t">
                                    <div className="flex justify-between">
                                        <span className="font-medium">Total Amount:</span>
                                        <span className="font-medium">
                                            ${order.payment.amount.toFixed(2)}
                                        </span>
                                    </div>
                                </div>

                                {/* Shipping Address */}
                                <div className="mt-4 pt-4 border-t text-sm">
                                    <h4 className="font-medium text-gray-900">Shipping Address:</h4>
                                    <p className="text-gray-600">
                                        {order.shipping_address.address},
                                        {order.shipping_address.city},
                                        {order.shipping_address.zip_code}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default OrderHistory;