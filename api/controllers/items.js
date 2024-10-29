const mongoose = require('mongoose');
const path = require('path');
const { error } = require('console');
const QRCode = require('qrcode');

const Item = require('../models/item');
const item = require('../models/item');


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

exports.items_create_item = async (req, res, next) => {
    try {
        const itemId = new mongoose.Types.ObjectId();

        // Step 1: Attempt to create and save the new item
        const item = new Item({
            _id: itemId,
            name: req.body.name,
            description: req.body.description,
            loggedBy: req.body.loggedBy,
        });
        const result = await item.save();
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
        const archiveItem = await item.findByIdAndUpdate(id, { isArchived }, { new: true });
        if (!archiveItem) {
            return res.status(404).json({
                message: 'Item not found'
            });
        }
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
}