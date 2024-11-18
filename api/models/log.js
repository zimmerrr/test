const mongoose = require('mongoose');

const logSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    action: { type: String, required: true }, // 'update_quantity', 'create', 'update', 'archive', or 'delete'
    itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
    timestamp: { type: Date, default: Date.now },
    performedBy: { type: String, required: true },
    description: { type: String, required: true, default: '' }
});

module.exports = mongoose.model('Log', logSchema);