const router = require('express').Router();
const userRoute = require('./user.route');
const authRoute = require('./auth.route');
const productRoute = require('./product.route');
const categoryRoute = require('./category.route');
const cartRoute = require('./cart.route');
const orderRoute = require('./order.route');
const base ="api/v1";

router.use(`/${base}/auth`, authRoute);
router.use(`/${base}/users`, userRoute);
router.use(`/${base}/products`, productRoute);
router.use(`/${base}/categories`, categoryRoute);
router.use(`/${base}/cart`, cartRoute);
router.use(`/${base}/orders`, orderRoute);

module.exports = router; 
