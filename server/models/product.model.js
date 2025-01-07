const mongoose = require('mongoose');

// Image Schema
const ImageSchema = new mongoose.Schema({
    url: { type: String, required: true, trim: true },
    is_primary: { type: Boolean, default: false }
});

// Variant Schema
const VariantSchema = new mongoose.Schema({
    sku: { type: String, required: true, unique: true, trim: true },
    size: { type: String, required: true, trim: true },
    color: { type: String, required: true, trim: true },
    stock: { type: Number, required: true, min: 0, default: 0 }
});

// Review Schema
const ReviewSchema = new mongoose.Schema({
    user_id: { type: String, required: true, trim: true },
    rating: { 
        type: Number, 
        required: true,
        min: 1,
        max: 5
    },
    review_text: { type: String, required: true, trim: true }
}, { timestamps: true });

// Product Schema
const ProductSchema = new mongoose.Schema({
    _id: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    price: { 
        type: Number,
        required: true,
        min: 0,
        get: v => parseFloat(v.toFixed(2)), // Ensures price is always 2 decimal places
        set: v => parseFloat(v.toFixed(2))
    },
    categories: [{ 
        type: String,
        ref: 'Category',
        trim: true 
    }],
    variants: [VariantSchema],
    images: [ImageSchema],
    reviews: [ReviewSchema]
}, { 
    timestamps: true,
    toJSON: { getters: true } // Ensures the getter for price is applied when converting to JSON
});


ProductSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Product', ProductSchema);