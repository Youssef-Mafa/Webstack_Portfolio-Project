const mongoose = require('mongoose');

// Cart Item Schema
const CartItemSchema = new mongoose.Schema({
    product_id: { type: String, required: true, trim: true },
    variant_id: { type: String, required: true, trim: true },
    quantity: { 
        type: Number, 
        required: true,
        min: 1,
        default: 1 
    }
});

// Cart Schema
const CartSchema = new mongoose.Schema({
    _id: { type: String, required: true, trim: true },
    user_id: { type: String, required: true, trim: true },
    items: {
        type: [CartItemSchema],
        default: [],
        validate: [
            {
                validator: function(items) {
                    // Check for duplicate product/variant combinations
                    const seen = new Set();
                    return items.every(item => {
                        const key = `${item.product_id}-${item.variant_id}`;
                        if (seen.has(key)) return false;
                        seen.add(key);
                        return true;
                    });
                },
                message: 'Duplicate product and variant combinations are not allowed'
            }
        ]
    }
}, { 
    timestamps: true 
});

CartSchema.index({ user_id: 1 });

module.exports = mongoose.model('Cart', CartSchema);