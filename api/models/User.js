const mongoose = require('mongoose');

const schema = mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: true,
    },
    username: {
        type: String,
        trim: true,
        required: true,
        unique: true
    },
    restore: {
        type: String,
    },
    password: {
        type: String,
        require: true
    },
    role: {
        type: Number,
        default: 0
    },
    classId: {
        type: String,
    },
    active: {
        type: Boolean,
        default: true
    }
});

module.exports = mongoose.model('User', schema);