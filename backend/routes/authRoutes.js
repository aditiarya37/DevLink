const express = require('express');
const { registerUser,loginUser, forgotPassword, resetPassword } = require('../controllers/authController');

const router = express.Router();

console.log("--- Initializing authRoutes ---");

router.post('/register',registerUser);

router.post('/login',loginUser);

router.post('/forgotpassword', forgotPassword);

router.put('/resetpassword/:resettoken', resetPassword);

module.exports = router;