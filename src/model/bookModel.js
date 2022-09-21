const mongoose = require('mongoose');
let ObjectId = mongoose.Schema.Types.ObjectId

const booksModel = new mongoose.Schema({

    title: {
        type: String,
        required: true,
        unique: true,
        trim : true
    },
    excerpt: {
        type: String,
        required:true ,
         trim : true
    },
    userId: {
        type: ObjectId,
        required: true,
        ref: "userModel",
         trim : true
    },
    ISBN: {
        type: String,
        required: true,
        unique: true,
         trim : true
    },
    category: {
        type: String,
        required: true,
         trim : true
    },
    subcategory: {
        type: [String],
        required: true,
         trim : true
    },
    reviews: {
        type: Number,
        default: 0,
        comment: Number,
        trim : true
    },
    deletedAt: {
        type: Date,
        default: null
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    releasedAt: {
        type: Date,
        required: true
    },
}, { timestamps: true });

module.exports = mongoose.model('book', booksModel)