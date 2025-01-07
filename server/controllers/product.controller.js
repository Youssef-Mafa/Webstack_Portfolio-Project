const Product = require('../models/product.model');
const mongoose = require('mongoose');

const productController = {
    // Create new product
    createProduct: async (req, res) => {
        try {
            const { name, description, price, categories, variants, images } = req.body;

            const product = new Product({
                _id: new mongoose.Types.ObjectId().toString(),
                name,
                description,
                price,
                categories,
                variants,
                images
            });

            await product.save();
            res.status(201).json({ 
                message: 'Product created successfully', 
                product 
            });
        } catch (error) {
            res.status(500).json({ 
                message: 'Error creating product', 
                error: error.message 
            });
        }
    },

    // Get all products with pagination and filtering
    getAllProducts: async (req, res) => {
        try {
            const { page = 1, limit = 10, category, minPrice, maxPrice, search } = req.query;
            
            // Build query
            let query = {};
            
            if (category) {
                query.categories = category;
            }
            
            if (minPrice || maxPrice) {
                query.price = {};
                if (minPrice) query.price.$gte = parseFloat(minPrice);
                if (maxPrice) query.price.$lte = parseFloat(maxPrice);
            }
            
            if (search) {
                query.$text = { $search: search };
            }

            const products = await Product.find(query)
                .limit(limit * 1)
                .skip((page - 1) * limit)
                .exec();

            const count = await Product.countDocuments(query);

            res.json({
                products,
                totalPages: Math.ceil(count / limit),
                currentPage: page
            });
        } catch (error) {
            res.status(500).json({ 
                message: 'Error fetching products', 
                error: error.message 
            });
        }
    },

    // Get single product by ID
    getProduct: async (req, res) => {
        try {
            const product = await Product.findById(req.params.id);
            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }
            res.json(product);
        } catch (error) {
            res.status(500).json({ 
                message: 'Error fetching product', 
                error: error.message 
            });
        }
    },

    // Update product
    updateProduct: async (req, res) => {
        try {
            const { name, description, price, categories, variants, images } = req.body;
            
            const product = await Product.findByIdAndUpdate(
                req.params.id,
                {
                    name,
                    description,
                    price,
                    categories,
                    variants,
                    images
                },
                { new: true, runValidators: true }
            );

            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }

            res.json({ 
                message: 'Product updated successfully', 
                product 
            });
        } catch (error) {
            res.status(500).json({ 
                message: 'Error updating product', 
                error: error.message 
            });
        }
    },

    // Delete product
    deleteProduct: async (req, res) => {
        try {
            const product = await Product.findByIdAndDelete(req.params.id);
            
            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }

            res.json({ 
                message: 'Product deleted successfully', 
                product 
            });
        } catch (error) {
            res.status(500).json({ 
                message: 'Error deleting product', 
                error: error.message 
            });
        }
    }
};

module.exports = productController;