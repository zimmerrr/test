const mongoose = require('mongoose');

const itemSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: { type: String, required: true },
    description: { type: String, required: true },
    loggedBy: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    qrCode: { type: String },

    //archive checker
    isArchived: { type: Boolean, default: false },
});

module.exports = mongoose.model('Item', itemSchema);