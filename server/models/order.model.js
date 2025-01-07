const mongoose = require('mongoose');

// Order Item Schema
const OrderItemSchema = new mongoose.Schema({
    product_id: { type: String, required: true, trim: true },
    variant_id: { type: String, required: true, trim: true },
    quantity: { 
        type: Number, 
        required: true,
        min: 1 
    },
    price: { 
        type: Number,
        required: true,
        min: 0,
        get: v => parseFloat(v.toFixed(2)),
        set: v => parseFloat(v.toFixed(2))
    }
});

// Shipping Address Schema
const ShippingAddressSchema = new mongoose.Schema({
    address: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    zip_code: { type: String, required: true, trim: true }
});

// Payment Schema
const PaymentSchema = new mongoose.Schema({
    method: { 
        type: String, 
        required: true,
        trim: true,
        enum: ['Credit Card', 'COD', 'PayPal', 'Bank Transfer']
    },
    amount: { 
        type: Number,
        required: true,
        min: 0,
        get: v => parseFloat(v.toFixed(2)),
        set: v => parseFloat(v.toFixed(2))
    },
    transaction_id: { type: String, required: true, unique: true, trim: true }
});

// Order Schema
const OrderSchema = new mongoose.Schema({
    _id: { type: String, required: true, trim: true },
    user_id: { type: String, required: true, trim: true },
    items: {
        type: [OrderItemSchema],
        required: true,
        validate: [
            {
                validator: function(items) {
                    return items.length > 0;
                },
                message: 'Order must contain at least one item'
            }
        ]
    },
    status: { 
        type: String, 
        required: true,
        trim: true,
        enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
        default: 'Pending'
    },
    shipping_address: { type: ShippingAddressSchema, required: true },
    payment: { type: PaymentSchema, required: true }
}, { 
    timestamps: true,
    toJSON: { getters: true }
});


OrderSchema.index({ user_id: 1 });
OrderSchema.index({ status: 1 });

// Virtual for total order amount
OrderSchema.virtual('total_amount').get(function() {
    return parseFloat(this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2));
});

module.exports = mongoose.model('Order', OrderSchema);