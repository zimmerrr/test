const express = require('express');
const router = express.Router();
const multer = require('multer');
const checkAuth = require('../middleware/check-auth');

const UsersController = require('../controllers/users');

//ROUTERS

router.get('/', UsersController.users_get_user);
router.get('/myProfile', UsersController.users_profile_user);
router.get('/:id', UsersController.users_get_userById);
router.post('/tokenValidation', UsersController.users_token_validation);
router.post('/signUp', UsersController.users_create_user);
router.post('/logIn', UsersController.users_login_user);
router.put('/archive/:id', UsersController.users_archive_user);

module.exports = router;
