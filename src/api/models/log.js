const mongoose = require('mongoose');

const logSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    controlNumber: { type: String, required: true },
    name: { type: String, required: true },
    action: { type: String, required: true }, // 'create', 'update'
    timestamp: { type: Date, default: Date.now },
    performedBy: { type: String, required: true },
    description: { type: String, required: true, default: "none" }
});

module.exports = mongoose.model('Log', logSchema);