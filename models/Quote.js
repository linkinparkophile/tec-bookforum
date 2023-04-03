const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const quoteSchema = new Schema({
    bookTitle: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    quoteContent: {
        type: String,
        required: true
    },
    pageNumber: {
        type: Number,
        required: true
    }
}, {
    timestamps: true
});

const Quote = mongoose.model('Quote', quoteSchema);
module.exports = Quote;
