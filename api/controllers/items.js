const mongoose = require('mongoose');
const path = require('path');
const QRCode = require('qrcode');

const Item = require('../models/item');
const Log = require('../models/log');


const createLog = async (action, itemId, performedBy, description) => {
    const log = new Log({
        _id: new mongoose.Types.ObjectId(),
        action,
        itemId,
        performedBy,
        description,
    });

    try {
        await log.save();
        console.log(`Log created: ${action} for item ${itemId}`);
    } catch (err) {
        console.error('Error creating log entry:', err);
    }
};

exports.logs_get_log = (req, res, next) => {
    Log.find()
        .exec()
        .then(doc => {
            const response = {
                count: doc.length,
                logs: doc
            }
            res.status(200).json(response);
        })
        .catch(err => {
            res.status(500).json({
                message: "Error in retrieving logs",
                error: err
            })
        })
};

exports.items_get_item = (req, res, next) => {
    Item.find()
        .exec()
        .then(doc => {
            const response = {
                count: doc.length,
                items: doc
            }
            res.status(200).json(response);
        })
        .catch(err => {
            res.status(500).json({
                message: "Error in retrieving items",
                error: err
            })
        })
};

exports.items_get_itemById = (req, res, next) => {

    Item.findOne({ _id: req.params.id })
        .exec()
        .then(doc => {
            res.status(200).json(doc);
        })
        .catch(err => {
            res.status(500).json({
                message: "Error in retrieving items",
                error: err
            })
        })
};

exports.items_create_item = async (req, res, next) => {
    console.log('Request Body:', req.body);
    try {
        const itemId = new mongoose.Types.ObjectId();

        // Step 1: Attempt to create and save the new item
        const item = new Item({
            _id: itemId,
            name: req.body.name,
            category: req.body.category,
            quantity: req.body.quantity,
            location: req.body.location,
            description: req.body.description,
            loggedBy: req.body.loggedBy,
        });
        const result = await item.save();
        await createLog('create', itemId, req.body.loggedBy, req.body.description || 'Unknown');
        console.log('Item created successfully:', result);

        // Step 2: Attempt to generate the QR code file
        const qrCodeFilePath = path.join(__dirname, '../../uploads', `qrcode-${itemId}.png`);
        try {
            await QRCode.toFile(qrCodeFilePath, itemId.toString());
            console.log('QR code generated at:', qrCodeFilePath);
        } catch (qrError) {
            console.error('Error generating QR code:', qrError);
            return res.status(500).json({
                message: "Error generating QR code",
                error: qrError
            });
        }

        // Step 3: Attempt to update the item with the QR code path
        item.qrCode = qrCodeFilePath;
        const updatedItem = await item.save();
        console.log('Item updated with QR code path:', updatedItem);

        // Step 4: Send a successful response
        res.status(201).json({
            message: "Item successfully registered",
            createdItem: updatedItem
        });

    } catch (err) {
        console.error('Error in creating item', err);
        res.status(500).json({
            message: "Error in creating item",
            error: err
        });
    }
};

exports.items_scan_item = async (req, res, next) => {

    try {
        const itemId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(itemId)) {
            return res.status(400).json({ message: 'Invalid item ID' });
        }

        const item = await item.findById(itemId);
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        res.status(200).json({
            message: 'Item details retrieved successfully',
            item
        });
    }
    catch (err) {
        console.error('Error fetching item details:', err);
        res.status(500).json({
            message: 'Error retrieving item details',
            error: err
        });
    }
};

exports.items_archive_item = async (req, res, next) => {
    const id = req.params.id;
    const { isArchived } = req.body;

    if (typeof isArchived !== 'boolean') {
        return res.status(400).json({
            message: 'Invalid value for isArchived'
        });
    }
    try {
        const archiveItem = await Item.findByIdAndUpdate(id, { isArchived }, { new: true });
        if (!archiveItem) {
            return res.status(404).json({
                message: 'Item not found'
            });
        }
        await createLog('archive', id, req.body.loggedBy, "archived" || 'Unknown');
        res.status(200).json({
            message: 'Item archived successfully',
            item: archiveItem
        });
    } catch (err) {
        res.status(500).json({
            message: 'Error archiving item',
            error: err
        });
    }
};

exports.items_update_quantity = async (req, res, next) => {
    const id = req.params.id;
    const { quantityChange, loggedBy } = req.body;

    if (typeof quantityChange !== 'number' || !Number.isInteger(quantityChange)) {
        return res.status(400).json({
            message: 'Invalid value for quantityChange. It must be an integer.'
        });
    }

    try {
        // Find the item by ID
        const item = await Item.findById(id);
        if (!item) {
            return res.status(404).json({
                message: 'Item not found'
            });
        }

        // Update the quantity
        item.quantity += quantityChange;

        // Ensure that the quantity does not go below zero
        if (item.quantity < 0) {
            return res.status(400).json({
                message: 'Insufficient quantity. The item quantity cannot be negative.'
            });
        }

        await createLog('update_quantity', id, loggedBy, req.body.description || 'Unknown');
        const updatedItem = await item.save();

        res.status(200).json({
            message: 'Item quantity updated successfully',
            item: updatedItem
        });
    } catch (err) {
        console.error('Error updating item quantity:', err);
        res.status(500).json({
            message: 'Error updating item quantity',
            error: err
        });
    }
};

exports.items_update_item = async (req, res, next) => {
    const id = req.params.id;
    const { name, category, quantity, location, description, loggedBy } = req.body;

    try {
        // Find the item by ID and update
        const updatedItem = await Item.findByIdAndUpdate(
            id,
            {
                name,
                category,
                quantity,
                location,
                description,
                loggedBy: loggedBy || "unknown" // Default loggedBy if not provided
            },
            { new: true } // This ensures the updated item is returned
        );

        if (!updatedItem) {
            return res.status(404).json({ message: 'Item not found' });
        }
        await createLog('update Item', id, loggedBy, description || 'Unknown');
        res.status(200).json({
            message: 'Item updated successfully',
            item: updatedItem
        });
    } catch (err) {
        console.error('Error updating item:', err);
        res.status(500).json({
            message: 'Error updating item',
            error: err
        });
    }
};
