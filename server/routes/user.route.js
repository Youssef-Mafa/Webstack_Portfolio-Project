const router = require('express').Router();
const User = require('../models/user.model');
const authMiddleware = require('../middleware/auth.middleware');
const bcrypt = require('bcryptjs');

// Public route
router.get("/public", (req, res) => {
    res.json({ message: "This is public" });
});

// Get user profile
router.get("/profile", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId)
            .select('-password_hash')
            .exec();

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ 
            message: 'Error fetching profile', 
            error: error.message 
        });
    }
});

// Update user profile
router.put("/profile", authMiddleware, async (req, res) => {
    try {
        const { username, email, full_name, addresses } = req.body;

        // Check if addresses exceed maximum limit
        if (addresses && addresses.length > 2) {
            return res.status(400).json({
                message: 'Maximum of 2 addresses allowed'
            });
        }

        // Check if email or username is already taken
        const existingUser = await User.findOne({
            $and: [
                { _id: { $ne: req.user.userId } },
                { $or: [{ email }, { username }] }
            ]
        });

        if (existingUser) {
            return res.status(400).json({
                message: 'Email or username already exists'
            });
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.user.userId,
            {
                username,
                email,
                full_name,
                addresses
            },
            { new: true }
        ).select('-password_hash');

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ 
            message: 'Error updating profile', 
            error: error.message 
        });
    }
});

// Change password
router.put("/change-password", authMiddleware, async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const user = await User.findById(req.user.userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Verify old password
        const isValidPassword = await bcrypt.compare(oldPassword, user.password_hash);
        if (!isValidPassword) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password_hash = hashedPassword;
        await user.save();

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error changing password', 
            error: error.message 
        });
    }
});

// Get users (you might want to add admin middleware here)
router.get("/get-users", (req, res) => {
    res.send("user 7adir");
});

router.get('/profile/:userId', authMiddleware, async (req, res) => {
    try {
      const user = await User.findById(req.params.userId)
        .select('-password_hash') // Exclude sensitive data
        .exec();
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      res.json(user);
    } catch (error) {
      res.status(500).json({ 
        message: 'Error fetching user profile', 
        error: error.message 
      });
    }
  });

module.exports = router;