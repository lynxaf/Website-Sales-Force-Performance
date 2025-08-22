const express = require('express');
const router = express.Router();
const { login, register, getProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login); 



module.exports = router;