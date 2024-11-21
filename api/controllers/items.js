const mongoose = require('mongoose');
const path = require('path');
const QRCode = require('qrcode');

const Item = require('../models/item');
const Log = require('../models/log');
const item = require('../models/item');

const createLog = async (action, name, controlNumber, performedBy, description, res) => {
    const log = new Log({
        _id: new mongoose.Types.ObjectId(),
        controlNumber,
        name,
        action,
        performedBy,
        description,
    });

    try {
        await log.save();
    } catch (err) {
        return res.status(500).json({
            message: "Error creating log",
            error: err
        });
    }
};

const performUpdate = (id, updateFields, res) => {
    Item.findByIdAndUpdate(id, updateFields, { new: true })
        .then((updated) => {
            if (!updated) {
                return res.status(404).json({ message: "id not found" });
            }
            createLog('update', updated.name, updated.controlNumber, updated.loggedBy, updated.description, res || 'Unknown');
            return res.status(200).json(updated);

        })
        .catch((err) => {
            return res.status(500).json({
                message: "Error in updating user",
                error: err
            });
        })
};

exports.items_search_item = async (req, res, next) => {
    try {
        const { query, filter } = req.query;
        let searchCriteria = {};

        if (!query && !filter) {
            return Item.find()
                .exec()
                .then((doc) => {
                    return res.status(200).json(doc);
                })
                .catch((err) => {
                    return res.status(500).json({
                        message: "Error in retrieving items",
                        error: err
                    });
                });
        }

        const queryConditions = [];

        if (query) {
            queryConditions.push({
                $or: [
                    { controlNumber: { $regex: query, $options: 'i' } },
                    { name: { $regex: query, $options: 'i' } },
                    { category: { $regex: query, $options: 'i' } },
                    { location: { $regex: query, $options: 'i' } },
                    { description: { $regex: query, $options: 'i' } },
                    { loggedBy: { $regex: query, $options: 'i' } },
                ],
            });
        }
        if (filter) {
            queryConditions.push({
                $or: [
                    { controlNumber: { $regex: filter, $options: 'i' } },
                    { name: { $regex: filter, $options: 'i' } },
                    { category: { $regex: filter, $options: 'i' } },
                    { location: { $regex: filter, $options: 'i' } },
                    { description: { $regex: filter, $options: 'i' } },
                    { loggedBy: { $regex: filter, $options: 'i' } },
                ],
            });
        }

        if (queryConditions.length > 0) {
            searchCriteria = { $and: queryConditions };
        }

        const items = await Item.find(searchCriteria);

        if (items.length === 0) {
            return res.status(200).json(items);
        }

        return res.status(200).json(items);
    }
    catch (err) {
        return res.status(500).json(err);
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
            return res.status(200).json(response);
        })
        .catch(err => {
            return res.status(500).json({
                message: "Error in retrieving logs",
                error: err
            })
        })
};

exports.items_create_item = async (req, res, next) => {
    try {
        const itemId = new mongoose.Types.ObjectId();
        const item = new Item({
            _id: itemId,
            controlNumber: req.body.controlNumber,
            name: req.body.name,
            category: req.body.category,
            location: req.body.location,
            description: req.body.description,
            loggedBy: req.body.loggedBy,
        });
        const result = await item.save();
        await createLog('create', req.body.name, req.body.controlNumber, req.body.loggedBy, req.body.description, res || 'Unknown');

        // Step 2: Attempt to generate the QR code file
        const qrCodeFilePath = path.join(__dirname, '../../uploads', `qrcode-${itemId}.png`);
        try {
            await QRCode.toFile(qrCodeFilePath, itemId.toString());
        } catch (qrError) {
            return res.status(500).json({
                message: "Error generating QR code",
                error: qrError
            });
        }

        // Step 3: Attempt to update the item with the QR code path
        item.qrCode = qrCodeFilePath;
        const updatedItem = await item.save();

        // Step 4: Send a successful response
        return res.status(201).json({
            message: "Item successfully registered",
            createdItem: updatedItem
        });

    } catch (err) {
        return res.status(500).json({
            message: "Error in creating item",
            error: err
        });
    }
};

exports.items_update_item = async (req, res, next) => {
    const id = req.params.id;
    const updateFields = req.body;
    performUpdate(id, updateFields, res);
};




