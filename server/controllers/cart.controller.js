const Cart = require('../models/cart.model');
const Product = require('../models/product.model');
const mongoose = require('mongoose');

const cartController = {
    // Get user's cart
    getCart: async (req, res) => {
        try {
            let cart = await Cart.findOne({ user_id: req.user.userId });
            
            if (!cart) {
                cart = new Cart({
                    _id: new mongoose.Types.ObjectId().toString(),
                    user_id: req.user.userId,
                    items: []
                });
                await cart.save();
            }

            // Populate product details for each cart item
            const populatedCart = await Cart.aggregate([
                { $match: { _id: cart._id } },
                { $unwind: "$items" },
                {
                    $lookup: {
                        from: "products",
                        let: { productId: "$items.product_id" },
                        pipeline: [
                            { $match: { $expr: { $eq: ["$_id", "$$productId"] } } },
                            { $project: { name: 1, price: 1, images: 1 } }
                        ],
                        as: "productDetails"
                    }
                },
                { $unwind: "$productDetails" },
                {
                    $group: {
                        _id: "$_id",
                        user_id: { $first: "$user_id" },
                        items: {
                            $push: {
                                product_id: "$items.product_id",
                                variant_id: "$items.variant_id",
                                quantity: "$items.quantity",
                                productDetails: "$productDetails"
                            }
                        }
                    }
                }
            ]);

            res.json(populatedCart[0] || cart);
        } catch (error) {
            res.status(500).json({
                message: 'Error fetching cart',
                error: error.message
            });
        }
    },

    // Add item to cart
    addToCart: async (req, res) => {
        try {
            const { product_id, variant_id, quantity } = req.body;

            // Validate product and variant existence
            const product = await Product.findById(product_id);
            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }

            const variant = product.variants.find(v => v.sku === variant_id);
            if (!variant) {
                return res.status(404).json({ message: 'Product variant not found' });
            }

            // Check stock availability
            if (variant.stock < quantity) {
                return res.status(400).json({ message: 'Insufficient stock' });
            }

            let cart = await Cart.findOne({ user_id: req.user.userId });

            if (!cart) {
                cart = new Cart({
                    _id: new mongoose.Types.ObjectId().toString(),
                    user_id: req.user.userId,
                    items: []
                });
            }

            // Check if item already exists in cart
            const existingItemIndex = cart.items.findIndex(
                item => item.product_id === product_id && item.variant_id === variant_id
            );

            if (existingItemIndex > -1) {
                // Update quantity if item exists
                cart.items[existingItemIndex].quantity += quantity;
            } else {
                // Add new item
                cart.items.push({ product_id, variant_id, quantity });
            }

            await cart.save();
            res.json({ message: 'Item added to cart successfully', cart });
        } catch (error) {
            res.status(500).json({
                message: 'Error adding item to cart',
                error: error.message
            });
        }
    },

    // Update cart item quantity
    updateCartItem: async (req, res) => {
        try {
            const { product_id, variant_id, quantity } = req.body;

            // Validate quantity
            if (quantity < 1) {
                return res.status(400).json({ message: 'Quantity must be at least 1' });
            }

            const cart = await Cart.findOne({ user_id: req.user.userId });
            if (!cart) {
                return res.status(404).json({ message: 'Cart not found' });
            }

            const itemIndex = cart.items.findIndex(
                item => item.product_id === product_id && item.variant_id === variant_id
            );

            if (itemIndex === -1) {
                return res.status(404).json({ message: 'Item not found in cart' });
            }

            // Check stock availability
            const product = await Product.findById(product_id);
            const variant = product.variants.find(v => v.sku === variant_id);
            if (variant.stock < quantity) {
                return res.status(400).json({ message: 'Insufficient stock' });
            }

            cart.items[itemIndex].quantity = quantity;
            await cart.save();

            res.json({ message: 'Cart updated successfully', cart });
        } catch (error) {
            res.status(500).json({
                message: 'Error updating cart',
                error: error.message
            });
        }
    },

    // Remove item from cart
    removeFromCart: async (req, res) => {
        try {
            const { product_id, variant_id } = req.params;

            const cart = await Cart.findOne({ user_id: req.user.userId });
            if (!cart) {
                return res.status(404).json({ message: 'Cart not found' });
            }

            cart.items = cart.items.filter(
                item => !(item.product_id === product_id && item.variant_id === variant_id)
            );

            await cart.save();
            res.json({ message: 'Item removed from cart successfully', cart });
        } catch (error) {
            res.status(500).json({
                message: 'Error removing item from cart',
                error: error.message
            });
        }
    },

    // Clear cart
    clearCart: async (req, res) => {
        try {
            const cart = await Cart.findOne({ user_id: req.user.userId });
            if (!cart) {
                return res.status(404).json({ message: 'Cart not found' });
            }

            cart.items = [];
            await cart.save();

            res.json({ message: 'Cart cleared successfully', cart });
        } catch (error) {
            res.status(500).json({
                message: 'Error clearing cart',
                error: error.message
            });
        }
    }
};

module.exports = cartController;