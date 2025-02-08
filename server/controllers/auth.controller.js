const User = require('../models/user.model');
const OTP = require('../models/otp.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const emailService = require('../services/email.service');

const authController = {
    register: async (req, res) => {
        try {
            const { email, password, username, full_name } = req.body;

            // Check if user already exists
            const existingUser = await User.findOne({ 
                $or: [{ email }, { username }] 
            });
            
            if (existingUser) {
                return res.status(400).json({ 
                    message: 'Email or username already exists' 
                });
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create new user
            const user = new User({
                _id: new mongoose.Types.ObjectId().toString(),
                email,
                password_hash: hashedPassword,
                username,
                full_name,
                is_verified: false
            });

            await user.save();

            // Generate and send OTP
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            await OTP.create({
                email,
                otp
            });

            // Send verification email
            await emailService.sendOTP(email, otp);

            // Generate JWT
            const token = jwt.sign(
                { userId: user._id, roles: user.roles },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.status(201).json({
                message: 'User registered successfully. Please verify your email.',
                token,
                user: {
                    id: user._id,
                    email: user.email,
                    username: user.username,
                    roles: user.roles,
                    is_verified: false
                }
            });
        } catch (error) {
            res.status(500).json({ message: 'Registration failed', error: error.message });
        }
    },

    login: async (req, res) => {
        try {
            const { email, password } = req.body;

            // Find user
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            // Verify password
            const isValidPassword = await bcrypt.compare(password, user.password_hash);
            if (!isValidPassword) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            // Check if user is verified
            if (!user.is_verified) {
                // Generate new OTP for unverified users
                const otp = Math.floor(100000 + Math.random() * 900000).toString();
                await OTP.create({
                    email,
                    otp
                });
                await emailService.sendOTP(email, otp);

                return res.json({ 
                    requiresVerification: true,
                    email: user.email
                });
            }

            // Generate JWT
            const token = jwt.sign(
                { userId: user._id, roles: user.roles },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.json({
                message: 'Login successful',
                token,
                user: {
                    id: user._id,
                    email: user.email,
                    username: user.username,
                    roles: user.roles,
                    is_verified: user.is_verified
                }
            });
        } catch (error) {
            res.status(500).json({ message: 'Login failed', error: error.message });
        }
    },

    sendVerificationOTP: async (req, res) => {
        try {
            const { email } = req.body;
            
            // Check if user exists
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Generate new OTP
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            
            // Delete any existing OTPs for this email
            await OTP.deleteMany({ email });
            
            // Save new OTP
            await OTP.create({
                email,
                otp
            });
            
            // Send OTP via email
            await emailService.sendOTP(email, otp);
            
            res.json({ message: 'Verification code sent successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Failed to send verification code', error: error.message });
        }
    },

    verifyOTP: async (req, res) => {
        try {
            const { email, otp } = req.body;
            
            // Find the latest OTP for this email
            const otpRecord = await OTP.findOne({ email }).sort({ createdAt: -1 });
            
            if (!otpRecord) {
                return res.status(400).json({ message: 'Verification code not found or expired' });
            }
            
            if (otpRecord.otp !== otp) {
                return res.status(400).json({ message: 'Invalid verification code' });
            }
            
            // Update user as verified
            const user = await User.findOneAndUpdate(
                { email }, 
                { is_verified: true },
                { new: true }
            );

            // Generate JWT
            const token = jwt.sign(
                { userId: user._id, roles: user.roles },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );
            
            // Delete the used OTP
            await OTP.deleteOne({ _id: otpRecord._id });
            
            res.json({
                message: 'Email verified successfully',
                token,
                user: {
                    id: user._id,
                    email: user.email,
                    username: user.username,
                    roles: user.roles,
                    is_verified: true
                }
            });
        } catch (error) {
            res.status(500).json({ message: 'Verification failed', error: error.message });
        }
    }
};

module.exports = authController;