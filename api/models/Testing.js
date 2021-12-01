const mongoose = require('mongoose');

const schema = mongoose.Schema({
    userId: {
        type: String,
        trim: true,
        required: true,
    },
    testId: {
        type: String,
        trim: true,
        required: true,
    },
    timeStart: {
        type: Date,
        required: true,
    },
    timeEnd: {
        type: Date,
    },
    questions: {
        type: Array,
        required: true,
    },
    answers: {
        type: Object,
    },
    mark: {
        type: Number,
        default: -1
    }
});

module.exports = mongoose.model('Testing', schema);