const mongoose = require('mongoose');

const passcatSchema = new mongoose.Schema({
    password_category: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

const passCateModel = mongoose.model('password_categories', passcatSchema);

module.exports = passCateModel;