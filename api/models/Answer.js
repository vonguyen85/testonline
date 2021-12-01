const mongoose = require('mongoose');

const schema = mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: true,
    }
});

module.exports = mongoose.model('Answer', schema);