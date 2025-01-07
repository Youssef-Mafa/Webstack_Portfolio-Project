const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
    _id: { type: String, required: true, trim: true },
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, trim: true },
    parent_id: { 
        type: String, 
        default: null, 
        trim: true,
        ref: 'Category'
    },
    slug: { type: String, required: true, unique: true, trim: true },
    is_active: { type: Boolean, default: true }
}, { 
    timestamps: true 
});

// Index for faster lookups
CategorySchema.index({ name: 'text', description: 'text' });
CategorySchema.index({ parent_id: 1 });

module.exports = mongoose.model('Category', CategorySchema);