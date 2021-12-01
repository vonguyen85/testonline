const mongoose = require('mongoose');

const schema = mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: true,
    },
    classId: {
        type: String,
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

module.exports = mongoose.model('Subject', schema);