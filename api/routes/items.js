const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer();
const checkAuth = require('../middleware/check-auth');

const itemsController = require('../controllers/items');
const item = require('../models/item');

//ROUTERS

router.get('/', itemsController.items_search_item);
router.get('/logs', itemsController.logs_get_log);
router.post('/', itemsController.items_create_item);
router.put('/update/:id', itemsController.items_update_item);

module.exports = router;