const Category = require('../models/category.model');
const mongoose = require('mongoose');

const categoryController = {
    // Create new category
    createCategory: async (req, res) => {
        try {
            const { name, description, parent_id, slug } = req.body;

            // Check if category with same name or slug exists
            const existingCategory = await Category.findOne({ 
                $or: [{ name }, { slug }] 
            });
            
            if (existingCategory) {
                return res.status(400).json({ 
                    message: 'Category with this name or slug already exists' 
                });
            }

            const category = new Category({
                _id: new mongoose.Types.ObjectId().toString(),
                name,
                description,
                parent_id,
                slug,
                is_active: true
            });

            await category.save();
            res.status(201).json({ 
                message: 'Category created successfully', 
                category 
            });
        } catch (error) {
            res.status(500).json({ 
                message: 'Error creating category', 
                error: error.message 
            });
        }
    },

    // Get all categories with optional parent_id filter
    getAllCategories: async (req, res) => {
        try {
            const { parent_id, is_active } = req.query;
            let query = {};

            if (parent_id !== undefined) {
                query.parent_id = parent_id;
            }

            if (is_active !== undefined) {
                query.is_active = is_active === 'true';
            }

            const categories = await Category.find(query)
                .populate('parent_id', 'name')
                .sort({ name: 1 });

            res.json(categories);
        } catch (error) {
            res.status(500).json({ 
                message: 'Error fetching categories', 
                error: error.message 
            });
        }
    },

    // Get category by ID
    getCategory: async (req, res) => {
        try {
            const category = await Category.findById(req.params.id)
                .populate('parent_id', 'name');

            if (!category) {
                return res.status(404).json({ message: 'Category not found' });
            }

            res.json(category);
        } catch (error) {
            res.status(500).json({ 
                message: 'Error fetching category', 
                error: error.message 
            });
        }
    },

    // Update category
    updateCategory: async (req, res) => {
        try {
            const { name, description, parent_id, slug, is_active } = req.body;

            // Check for existing category with same name or slug
            const existingCategory = await Category.findOne({
                _id: { $ne: req.params.id },
                $or: [{ name }, { slug }]
            });

            if (existingCategory) {
                return res.status(400).json({
                    message: 'Category with this name or slug already exists'
                });
            }

            const category = await Category.findByIdAndUpdate(
                req.params.id,
                {
                    name,
                    description,
                    parent_id,
                    slug,
                    is_active
                },
                { new: true, runValidators: true }
            );

            if (!category) {
                return res.status(404).json({ message: 'Category not found' });
            }

            res.json({ 
                message: 'Category updated successfully', 
                category 
            });
        } catch (error) {
            res.status(500).json({ 
                message: 'Error updating category', 
                error: error.message 
            });
        }
    },

    // Delete category
    deleteCategory: async (req, res) => {
        try {
            // Check if category has children
            const hasChildren = await Category.exists({ parent_id: req.params.id });
            if (hasChildren) {
                return res.status(400).json({ 
                    message: 'Cannot delete category with subcategories' 
                });
            }

            const category = await Category.findByIdAndDelete(req.params.id);
            
            if (!category) {
                return res.status(404).json({ message: 'Category not found' });
            }

            res.json({ 
                message: 'Category deleted successfully', 
                category 
            });
        } catch (error) {
            res.status(500).json({ 
                message: 'Error deleting category', 
                error: error.message 
            });
        }
    }
};

module.exports = categoryController;