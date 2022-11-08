const mongoose = require("mongoose");
const bookModel = require("../model/bookModel");
const reviewModel = require("../model/reviewModel");
const {
  isValidId,
  isValidName,
  isValidBody,
  isValid,
  isValidBookTitle,
} = require("../validators/validator");

//==================================================== creating review ===========================================================//

const createReview = async function (req, res) {
  try {
    let data = req.body;

    // adding bookId from path params to request body

    data.bookId = req.params.bookId;
    data.reviewedAt = new Date();

    const { reviewedBy, review, rating, bookId } = data;

    //  check for a valid request
    if (!isValidBody(data))
      return res.status(400).send({
        status: false,
        message: "Please enter data to create review ",
      });

    //  validating bookId
    if (!bookId)
      return res
        .status(400)
        .send({ status: false, message: "BookId is mandatory" });

    
    if (!isValidId(bookId))
      return res
        .status(400)
        .send({ status: false, message: "Invalid BookId !!" });

    //  check whether book is not deleted
    let book = await bookModel.findOne({ _id: bookId, isDeleted: true });
    if (book)
      return res.status(400).send({
        status: false,
        message: "No books available with is BookId !!",
      });

    //  validating review
    if (!review)
      return res
        .status(400)
        .send({ status: false, message: "review is mandatory" });

    if (!isValidName(review))
      return res
        .status(400)
        .send({ status: false, message: "review should be string !!" });

    //  validating reviewedBy

    if (!isValidName(reviewedBy))
      return res
        .status(400)
        .send({ status: false, message: "reviewedBy should be string !!" });

    //  validating rating
    if (!rating)
      return res
        .status(400)
        .send({ status: false, message: "rating is mandatory" });

    if (typeof rating != "number" || rating < 1 || rating > 5)
      return res.status(400).send({
        status: false,
        message: "rating should be number from 1-5 !!",
      });

    let updatedBook = await bookModel
      .findByIdAndUpdate(
        { _id: bookId },
        { $inc: { reviews: +1 }, reviewedAt: new Date() },
        { new: true }
      )
      .lean();

    // creating review document
    let saveData = await reviewModel.create(data);

    // adding bookId to review document
    saveData.bookId = bookId;

    // set reviewData inside book document
    updatedBook["reviewsData"] = saveData;

    return res.status(201).send({
      status: true,
      message: "Review created successfully",
      data: updatedBook,
    });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};


//==================================================== update review ===========================================================//

const updateReview = async (req, res) => {
  try {
    let bookId = req.params.bookId;

    // validating bookId
    if (!isValidId(bookId))
      return res.status(400).send({ satus: false, message: "Invalid bookId" });

    // search book for given bookId
    let requiredBook = await bookModel
      .findOne({
        _id: bookId,
        isDeleted: false,
      })
      .lean();

    if (!requiredBook)
      return res
        .status(404)
        .send({ status: false, message: "No such book present" });

    // fetch reviewId from params
    let reviewId = req.params.reviewId;

    // validating reviewId
    if (!isValidId(reviewId))
      return res
        .status(400)
        .send({ status: false, message: "invalid reviewId" });

    // search a review for given reviewId
    let requiredReview = await reviewModel.findOne({
      _id: reviewId,
      bookId,
      isDeleted: false,
    });

    if (!requiredReview)
      return res.status(400).send({
        status: false,
        message: "no such review present for that specific book",
      });

    // fetch data from request body for updation
    let data = req.body;

    let { reviewedBy, rating, review, reviewedAt } = data; //destructring

    // validating request body
    if (!isValidBody(req.body))
      return res
        .status(400)
        .send({ status: false, message: "All fields are required" });

    // validating reviewer's name
    if (!isValidName(reviewedBy)) {
      return res.status(400).send({
        status: false,
        message: "please enter the right format of review's name",
      });
    }

    // validating rating
    if (rating) {
      if (typeof rating != "number" || rating < 1 || rating > 5)
        return res.status(400).send({
          status: false,
          message: "rating should be number from 1-5 !!",
        });
    }

    // validating review
    if (!isValid(review))
      return res
        .status(400)
        .send({ status: false, message: "please enter review" });

    // you CAN'T update review at timing
    if (isValid(reviewedAt))
      return res
        .status(400)
        .send({ status: false, message: "can't update reviewedAt" });

    //  updating review
    let updatedReview = await reviewModel
      .findOneAndUpdate(
        { _id: reviewId, isdeleted: false },
        {
          $set: {
            reviewedBy: reviewedBy,
            rating: rating,
            review: review,
            reviewedAt: new Date(),
          },
        },
        { new: true }
      )
      .select({ isDeleted: 0 });

    // setting a new field reviewsData in book document
    requiredBook["reviewsData"] = updatedReview;

    // response for updated review
    return res
      .status(200)
      .send({ status: true, message: "Success", data: requiredBook });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

//==================================================== review Delete By Id ===========================================================//

const reviewDeleteById = async (req, res) => {
  try {
    let { bookId, reviewId } = req.params;

    // validating  bookID
    if (!bookId || !isValidId(bookId))
      return res.status(400).send({ status: false, message: "Invalid BookId" });

    //validating reviewID

    if (!reviewId || !isValidId(reviewId))
      return res
        .status(400)
        .send({ status: false, message: "Invalid reviewId" });

    //checking for bookId in books collection

    if (!(await bookModel.findOne({ _id: bookId, isDeleted: false })))
      return res
        .status(404)
        .send({ status: false, message: "Bookid not exist" });

    //updating isDeleted key in reviewModel
    let data = await reviewModel.updateOne(
      { _id: reviewId, bookId: bookId, isDeleted: false },
      { isDeleted: true }
    );
    if (data.matchedCount === 0)
      return res
        .status(404)
        .send({ status: false, message: "Review does not exist" });

    //updating number of reviews of reviews in book collection
    // console.log(book)
    book = await bookModel.findOneAndUpdate(
      { _id: bookId },
      { $inc: { reviews: -1 } },
      { new: true }
    );

    return res.status(200).send({ status: true, message: "Review is deleted" });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

module.exports = { createReview, updateReview, reviewDeleteById };
