const router = require('express').Router();
const userController = require('../controllers/users');
const { validateUserInfo } = require('../middlewares/validation');

router.get('/users/me', userController.getUserInfo);
router.patch('/users/me', validateUserInfo, userController.updateUserInfo);

module.exports = router;
