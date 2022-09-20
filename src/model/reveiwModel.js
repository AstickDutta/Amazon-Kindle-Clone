const mongoose = require('mongoose');
let ObjectId = mongoose.Schema.Types.ObjectId

const reviewSchema = new mongoose.Schema({

    bookId:{
        type: ObjectId,
        required:true,
        ref:"book"
    },
    reviewedBy: {
    type:String,
    default: 'Guest',
    required:true,
    trim:true
},
reviewedAt:{
    type: Date,
    required: true,
    trim:true
},
rating:{
    type: Number,
    required: true,
    min: 1,
    max: 5
}, 
review:{
    type:String,
    trim:true
},
isDeleted: {
    type:Boolean, 
    default: false
},
},{timestamps:true})

module.exports = mongoose.model("review", reviewSchema)