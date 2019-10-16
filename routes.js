const router = require('express').Router();
const auth = require('./middlewares/auth');
const usersController = require('./controllers/usersController');

// User routes
router.post('/users/register', usersController.register);
router.post('/users/login', usersController.login);
router.get('/users/profile', auth, usersController.profile);
router.post('/users/verify', usersController.verify);
router.post('/users/reset-password', usersController.resetPassword);
router.post('/users/reset-password-submit', usersController.resetPasswordSubmit);
router.post('/users/reset-password-verify', usersController.resetPasswordVerify);
//--User routes

module.exports = router;