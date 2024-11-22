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

exports.items_search_item = async (req, res) => {
    try {
        const { active, query, filter } = req.query;

        const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        let searchCriteria = {};
        const queryConditions = [];

        if (query) {
            const escapedQuery = escapeRegex(query);
            const orConditions = [];

            if (mongoose.Types.ObjectId.isValid(query)) {
                orConditions.push({ _id: query });
            }

            orConditions.push(
                { controlNumber: { $regex: escapedQuery, $options: 'i' } },
                { name: { $regex: escapedQuery, $options: 'i' } },
                { category: { $regex: escapedQuery, $options: 'i' } },
                { location: { $regex: escapedQuery, $options: 'i' } },
                { description: { $regex: escapedQuery, $options: 'i' } },
                { loggedBy: { $regex: escapedQuery, $options: 'i' } }
            );

            queryConditions.push({ $or: orConditions });
        }

        if (filter) {
            const escapedFilter = escapeRegex(filter);
            queryConditions.push({
                $or: [
                    { controlNumber: { $regex: escapedFilter, $options: 'i' } },
                    { name: { $regex: escapedFilter, $options: 'i' } },
                    { category: { $regex: escapedFilter, $options: 'i' } },
                    { location: { $regex: escapedFilter, $options: 'i' } },
                    { description: { $regex: escapedFilter, $options: 'i' } },
                    { loggedBy: { $regex: escapedFilter, $options: 'i' } },
                ],
            });
        }

        if (active) {
            const isActive = active === 'true';
            queryConditions.push({ active: isActive });
        }

        if (queryConditions.length > 0) {
            searchCriteria = { $and: queryConditions };
        }

        const items = await Item.find(searchCriteria);

        return res.status(200).json(items);
    } catch (err) {
        return res.status(500).json({
            message: 'Error while searching items',
            error: err,
        });
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
        await createLog('create', req.body.name, req.body.controlNumber, req.body.loggedBy, req.body.description, res || 'Unknown');

        const updatedItem = await item.save();

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




