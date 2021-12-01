const mongoose = require('mongoose');

const schema = mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: true,
    },
    questions: {
        type: Array,
        required: true,
    },
    time: {
        type: Number,
        required: true,
    },
    time_start: {
        type: Date,
        default: null
    },
    status: {
        type: Number,
        default: 0  //1: duyet, 0: cho
    },
    owner: {
        type: String,
        required: true,
        
    },
    classId: {
        type: String,
        required: true,
    },
    subjectId: {
        type: String,
        required: true,
    },
},
{
    timestamps: true
});

module.exports = mongoose.model('Test', schema);