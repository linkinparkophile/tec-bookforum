const { Router } = require('express');
const authController = require('../controllers/authController')
const router = Router();
// registration page:
router.get('/register', authController.register_get);

// create a new user: 
router.post('/register', authController.register_post)

// login page:
router.get('/login', authController.login_get);

// log in to the system:
router.post('/login', authController.login_post)

// logout:
router.get('/logout', authController.logout_get);

module.exports = router;
