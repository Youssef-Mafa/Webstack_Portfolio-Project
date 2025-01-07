const router = require('express').Router();
const cartController = require('../controllers/cart.controller');
const authMiddleware = require('../middleware/auth.middleware');

// All cart routes require authentication
router.use(authMiddleware);

router.get('/', cartController.getCart);
router.post('/add', cartController.addToCart);
router.put('/update', cartController.updateCartItem);
router.delete('/remove/:product_id/:variant_id', cartController.removeFromCart);
router.delete('/clear', cartController.clearCart);

module.exports = router;