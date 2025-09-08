const express = require('express');
const router = express.Router();
const { InitializePayment,VerifyPayment } = require('../controllers/payments');

router.post('/payment/initialize', InitializePayment);
router.get('/verify-payment/:reference', VerifyPayment);

module.exports=router