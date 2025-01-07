const router = require('express').Router();
const orderController = require('../controllers/order.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
    if (!req.user.roles.includes('admin')) {
        return res.status(403).json({ message: 'Access denied' });
    }
    next();
};

// All routes require authentication
router.use(authMiddleware);

// User routes
router.post('/create', orderController.createOrder);
router.get('/user-orders', orderController.getUserOrders);
router.get('/:id', orderController.getOrder);

// Admin routes
router.get('/admin/orders', authMiddleware, isAdmin, orderController.getAllOrders);
router.put('/:id/status', isAdmin, orderController.updateOrderStatus);
router.get('/stats/all', isAdmin, orderController.getOrderStats);


module.exports = router;