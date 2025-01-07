const mongoose = require('mongoose');

const AddressSchema = new mongoose.Schema({
    street_address: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    zip_code: { type: String, required: true, trim: true },
});

const UserSchema = new mongoose.Schema({
    // Remove unique: true from _id since MongoDB handles this automatically
    _id: { type: String, required: true, trim: true },
    email: { 
        type: String, 
        required: true, 
        unique: true, 
        trim: true,
        lowercase: true 
    },
    password_hash: { type: String, required: true },
    username: { type: String, required: true, unique: true, trim: true },
    full_name: { type: String, trim: true },
    roles: { 
        type: [String], 
        enum: ['customer', 'admin', 'seller'], 
        default: ['customer'] 
    },
    addresses: [AddressSchema],
}, { 
    timestamps: true 
});

// Create a compound index for better query performance
UserSchema.index({ email: 1, username: 1 });

const User = mongoose.model('User', UserSchema);

module.exports = User;