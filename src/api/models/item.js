const mongoose = require('mongoose');

const itemSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    controlNumber: { type: String, required: true },
    name: { type: String, required: true },
    category: { type: String, required: true }, //For archive or for disposal
    location: { type: String, required: true }, //Where the item is located
    description: { type: String, required: true }, // Description of the item
    loggedBy: { type: String, required: true, default: "unknown" },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }, //Last updated date
    //archive checker
    active: { type: Boolean, default: true },
});

module.exports = mongoose.model('Item', itemSchema);