const mongoose = require("mongoose")
const bookModel = require("../model/bookModel")
const reviewModel = require("../model/reviewModel")
const { isValidId, isValidName, isValidReleasedAt, isValidBody } = require("../validators/validator")




const createReview = async function (req, res) {

    try {
        let data = req.body

        // adding bookId from path params to request body

         data.bookId = req.params.bookId
         data.reviewedAt = new Date ()

        const { reviewedBy, review, rating, bookId } = data

        //  check for a valid request
        if (!isValidBody(data))
            return res.status(400).send({ status: false, message: "Please enter data to create review " })

        //  validating bookId
        if (!bookId)
            return res.status(400).send({ status: false, message: "BookId is mandatory" })

        console.log(bookId)
        if (!isValidId(bookId))
            return res.status(400).send({ status: false, message: "Invalid BookId !!" })

        //  check wether book is not deleted
        let book = await bookModel.findOne({ _id: bookId, isDeleted: true })
        if (book)
            return res.status(400).send({ status: false, message: "No books available with is BookId !!" })

        //  validating review
        if (!review)
            return res.status(400).send({ status: false, message: "reviews is mandatory" })

        if (!isValidName(review))
            return res.status(400).send({ status: false, message: "reviews should be string !!" })

        //  validating reviewedBy
        if (!reviewedBy)
            return res.status(400).send({ status: false, message: "reviewedBy is mandatory" })

        if (!isValidName(reviewedBy))
            return res.status(400).send({ status: false, message: "reviewedBy should be string !!" })


        //  validating rating
        if (!rating)
            return res.status(400).send({ status: false, message: "rating is mandatory" })

        if (!typeof rating === Number && rating >= 1 && rating <= 5)
            return res.status(400).send({ status: false, message: "reviewedAt should be number from 1-5 !!" })


        let updatedBook = await bookModel.findOneAndUpdate(
            { _id: bookId },
            {
                $set:
                {
                    review: review + 1,
                    reviewedAt: Date.now()
                }
            },
            { new: true })


        // creating review document 
        let saveData = await reviewModel.create(data)

        // adding bookId to review document

        saveData.bookId = updatedBook._id
        return res.status(201).send({ status: true, message: "Review created successfully", data: saveData })


    }
    catch (error) {
        res.status(400).send({ error: error.message })
    }
}


// -------------------- update review ------------------------------------------
const updateReview = async function(req, res) {
    try {
      const filteredData = {};
  
      const book = req.params.bookId;
      if (!isValidObject(book)) {
        return res.status(400).send({status: false,message: "Book Id is not valid"});}
  
      const existBook = await bookModel.findOne({ _id: book, isDeleted: false }).lean();
      if (!existBook) {
        return res.status(404).send({status: false,message: "No data found"});}
  
      const paramreview = req.params.reviewId;
      if (!isValidObject(paramreview)) {
       return  res.status(400).send({status: false,message: "review Id is not valid"});}
  
      const existReview = await reviewModel.findOne({_id: paramreview,bookId:existBook._id,isDeleted: false});
     
      if (!existReview) {
      return res.status(404).send({status: false,message: "No data found"});}
  
      const requestBody = req.body;
      if (!isValidBody(requestBody)) {
      return res.status(400).send({status: false,message: "required some mandatory data"});}
  
      const { review, rating, reviewedBy } = requestBody;
      
      if (reviewedBy !== undefined) {
        if (!isValidType(reviewedBy)) {
          return res.status(400).send({status: false,message: "type must be string and required some data inside string"});}
  
        if(!/^([a-zA-Z. , ]){1,100}$/.test(reviewedBy)){
          return res.status(400).send({status: false,message: "reviewedBy should be in alphabets"})}
  
        filteredData["reviewedBy"] = reviewedBy.trim().split(' ').filter(a=>a).join(' ');
      }
  
      if (rating !== undefined) {
        if (!isValid(rating) || typeof rating !== "number") {
          return res.status(400).send({status: false,message: "rating is required and type must be Number"});}
  
        if (rating < 1 || rating > 5) {
        return res.status(400).send({status: false,message: "rating should be between 1 to 5"});}
        
        filteredData["rating"] = rating;
      }
  
      if (review !== undefined) {
        if (!isValidType(review)) {
        return res.status(400).send({status: false,message: "type must be string and required some data inside string"});}
  
        filteredData["review"] = review.trim().split(' ').filter(a=>a).join(' ');
      }
  
      const updateReview = await reviewModel.findByIdAndUpdate({ _id: paramreview },{ $set: filteredData },{ new: true }).select({_id:1, bookId:1, reviewedBy:1, reviewedAt:1, rating:1, review:1});
     
      if (updateReview) {
        existBook.responData=updateReview
         
        return res.status(200).send({status: true,message: "Success",data: existBook});
      }
    } catch (err) {
      return res.status(500).send({status: false,message: err.message});}
  };

module.exports = { createReview ,updateReview}