const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer();
const checkAuth = require('../middleware/check-auth');

const itemsController = require('../controllers/items');
const item = require('../models/item');

//ROUTERS

router.get('/', itemsController.items_get_item);
router.get('/logs', itemsController.logs_get_log);
router.get('/scan/:id', itemsController.items_scan_item);
router.get('/:id', itemsController.items_get_itemById);
router.post('/', upload.none(), itemsController.items_create_item);
router.put('/update-quantity/:id', itemsController.items_update_quantity);
router.put('/archive/:id', itemsController.items_archive_item);
router.put('/update/:id', itemsController.items_update_item);

module.exports = router;