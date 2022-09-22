const mongoose = require("mongoose")
const bookModel = require("../model/bookModel")
const reviewModel = require("../model/reviewModel")
const { isValidId, isValidName, isValidReleasedAt, isValidBody } = require("../validators/validator")




const createReview = async function (req, res) {

    try {
        let data = req.body
        let bookId = req.params.bookId

        const { reviewedBy, review, rating } = data

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
        return res.status(201).send({ status: true, message: "Review created successfully", data: updatedBook })

    }
    catch (error) {
        res.status(400).send({ error: error.message })
    }
}

module.exports = { createReview }