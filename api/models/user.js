const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    middleName: { type: String },
    employeeId: { type: String, required: true },
    division: { type: String, required: true },
    username: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, required: true, default: 'employee' },
    //archive checker
    active: { type: Boolean, default: true },
});

module.exports = mongoose.model('User', userSchema);