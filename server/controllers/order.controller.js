const Order = require('../models/order.model');
const Cart = require('../models/cart.model');
const Product = require('../models/product.model');
const mongoose = require('mongoose');

const orderController = {
    createOrder: async (req, res) => {
        try {
            const { shipping_address, payment } = req.body;
            const userId = req.user.userId;

            const cart = await Cart.findOne({ user_id: userId });
            if (!cart || cart.items.length === 0) {
                return res.status(400).json({ message: 'Cart is empty' });
            }

            let orderItems = [];
            let totalAmount = 0;

            for (const item of cart.items) {
                const product = await Product.findById(item.product_id);
                if (!product) {
                    return res.status(404).json({ message: `Product ${item.product_id} not found` });
                }

                const variant = product.variants.find(v => v.sku === item.variant_id);
                if (!variant) {
                    return res.status(404).json({ message: `Variant ${item.variant_id} not found` });
                }

                if (variant.stock < item.quantity) {
                    return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
                }

                orderItems.push({
                    product_id: item.product_id,
                    variant_id: item.variant_id,
                    quantity: item.quantity,
                    price: product.price
                });

                totalAmount += product.price * item.quantity;
                variant.stock -= item.quantity;
                await product.save();
            }

            const order = new Order({
                _id: new mongoose.Types.ObjectId().toString(),
                user_id: userId,
                items: orderItems,
                shipping_address,
                payment: {
                    ...payment,
                    amount: totalAmount,
                    transaction_id: `TXN_${Date.now()}`
                },
                status: 'Pending'
            });

            await order.save();
            cart.items = [];
            await cart.save();

            res.status(201).json({
                message: 'Order created successfully',
                order
            });
        } catch (error) {
            res.status(500).json({
                message: 'Error creating order',
                error: error.message
            });
        }
    },

    getUserOrders: async (req, res) => {
        try {
            const { page = 1, limit = 10, status } = req.query;
            let query = { user_id: req.user.userId };

            if (status) {
                query.status = status;
            }

            const orders = await Order.find(query)
                .sort({ createdAt: -1 })
                .limit(limit * 1)
                .skip((page - 1) * limit);

            const count = await Order.countDocuments(query);

            res.json({
                orders,
                totalPages: Math.ceil(count / limit),
                currentPage: page
            });
        } catch (error) {
            res.status(500).json({
                message: 'Error fetching orders',
                error: error.message
            });
        }
    },

    getOrder: async (req, res) => {
        try {
            const order = await Order.findOne({
                _id: req.params.id,
                user_id: req.user.userId
            });

            if (!order) {
                return res.status(404).json({ message: 'Order not found' });
            }

            res.json(order);
        } catch (error) {
            res.status(500).json({
                message: 'Error fetching order',
                error: error.message
            });
        }
    },

    updateOrderStatus: async (req, res) => {
        try {
            const { status } = req.body;
            
            const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({ message: 'Invalid status' });
            }

            const order = await Order.findById(req.params.id);
            if (!order) {
                return res.status(404).json({ message: 'Order not found' });
            }

            if (status === 'Cancelled' && order.status !== 'Cancelled') {
                for (const item of order.items) {
                    const product = await Product.findById(item.product_id);
                    const variant = product.variants.find(v => v.sku === item.variant_id);
                    variant.stock += item.quantity;
                    await product.save();
                }
            }

            order.status = status;
            await order.save();

            res.json({
                message: 'Order status updated successfully',
                order
            });
        } catch (error) {
            res.status(500).json({
                message: 'Error updating order status',
                error: error.message
            });
        }
    },

    getOrderStats: async (req, res) => {
        try {
            const stats = await Order.aggregate([
                {
                    $group: {
                        _id: null,
                        totalOrders: { $sum: 1 },
                        totalRevenue: { $sum: "$payment.amount" },
                        averageOrderValue: { $avg: "$payment.amount" }
                    }
                }
            ]);

            const statusCounts = await Order.aggregate([
                {
                    $group: {
                        _id: "$status",
                        count: { $sum: 1 }
                    }
                }
            ]);

            res.json({
                statistics: stats[0],
                statusDistribution: statusCounts
            });
        } catch (error) {
            res.status(500).json({
                message: 'Error fetching order statistics',
                error: error.message
            });
        }
    },

    getAllOrders: async (req, res) => {
        try {
            const { page = 1, limit = 10, status, fromDate, toDate, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

            let query = {};
            
            if (status) {
                query.status = status;
            }
            
            if (fromDate && toDate) {
                query.createdAt = {
                    $gte: new Date(fromDate),
                    $lte: new Date(toDate)
                };
            }

            const sortOptions = {};
            sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

            const orders = await Order.find(query)
                .populate('user_id', 'email username full_name')
                .sort(sortOptions)
                .limit(limit * 1)
                .skip((page - 1) * limit)
                .lean();

            const count = await Order.countDocuments(query);

            const revenue = await Order.aggregate([
                { $match: query },
                {
                    $group: {
                        _id: null,
                        total: { $sum: "$payment.amount" }
                    }
                }
            ]);

            res.json({
                orders,
                totalPages: Math.ceil(count / limit),
                currentPage: parseInt(page),
                totalOrders: count,
                totalRevenue: revenue[0]?.total || 0
            });
        } catch (error) {
            res.status(500).json({
                message: 'Error fetching orders',
                error: error.message
            });
        }
    }
};

module.exports = orderController;