const mongoose = require('mongoose');

const schema = mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: true,
    },
    owner: {
        type: String,
        required: true,
    },
},
{
    timestamps: true
});

module.exports = mongoose.model('Class', schema);