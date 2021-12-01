const mongoose = require('mongoose');

const schema = mongoose.Schema({
    content: {
        type: String,
        trim: true,
        required: true,
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
    answer:{
        type: Array,
    },
    exact: {
        type: String,
        required: true,
    }

});

module.exports = mongoose.model('Question', schema);