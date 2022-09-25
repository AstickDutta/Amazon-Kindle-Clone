const mongosse = require("mongoose");
const bookModel = require("../model/bookModel");
const userModel = require("../model/userModel");
const reviewModel = require("../model/reviewModel");
const {
  isValidName,
  isValidBody,
  isValidId,
  isValidISBN,
  isValidReleasedAt,
  isValidBookTitle,
  isValid,
} = require("../validators/validator");

// ------------------- creating book -----------------------------------
const createBook = async (req, res) => {
  try {
    // Validating request body

    if (!isValidBody(req.body))
      return res
        .status(400)
        .send({ status: false, message: "All fields are required" });

    let { title, excerpt, userId, ISBN, category, subcategory, releasedAt } =
      req.body;

    // title validation

    if (!title)
      return res.status(400).send({
        status: false,
        message: "title is required ",
      });

    if (!isValidBookTitle(title.trim()))
      return res.status(400).send({
        status: false,
        message: "title should be a valid format",
      });

    let checkTitle = await bookModel.findOne({ title: title });
    if (checkTitle)
      return res
        .status(409)
        .send({ status: false, message: `'${title}' is already taken` });

    // excerpt validation

    if (!excerpt)
      return res.status(400).send({
        status: false,
        message: "excerpt is required",
      });

    if (!isValidBookTitle(excerpt.trim()))
      return res.status(400).send({
        status: false,
        message: "excerpt should be a valid format",
      });

    // userId validtion

    if (!userId)
      return res
        .status(400)
        .send({ status: false, message: "Please enter userId" });

    if (typeof userId != "string" || !isValidId(userId))
      return res
        .status(400)
        .send({ status: false, message: "Please enter valid userId" });

    //checking authorization

    if (req.decoded.userId != userId)
      return res
        .status(403)
        .send({ status: false, msg: "you are not authorised" });

    // search for a valid user
    let checkUser = await userModel.findOne({ _id: userId });
    if (!checkUser)
      return res
        .status(400)
        .send({ status: false, message: "User is not present" });

    //  ISBN validation

    if (!ISBN)
      return res
        .status(400)
        .send({ status: false, message: "Please enter ISBN" });

    if (typeof ISBN != "string" || !isValidISBN(ISBN.trim()))
      return res
        .status(400)
        .send({ status: false, message: "Please enter valid ISBN " });

    // check if ISBN already exist or not

    let checkISBN = await bookModel.findOne({ ISBN: ISBN });
    if (checkISBN)
      return res.status(400).send({
        status: false,
        message: `ISBN '${req.body.ISBN}' already exist`,
      });

    // category validation
    if (!category)
      return res
        .status(400)
        .send({ status: false, message: "Please enter category" });

    if (!isValidName(category.trim()))
      return res
        .status(400)
        .send({ status: false, message: "Please enter valid Category" });

    // subcategory validation
    if (!subcategory)
      return res
        .status(400)
        .send({ status: false, message: "Please enter subcategory" });

    if (!isValidName(subcategory.trim()))
      return res
        .status(400)
        .send({ status: false, message: "Please enter valid subcategory" });

    // released date validation
    if (!releasedAt)
      return res
        .status(400)
        .send({ status: false, message: "Please enter release date" });

    if (!isValidReleasedAt(releasedAt.trim()))
      return res.status(400).send({
        status: false,
        message: "Please enter valid release date in YYYY-MM-DD format",
      });

    // creating new book
    const savedData = await bookModel.create(req.body);
    return res
      .status(201)
      .send({ status: true, message: "Sucessfully created", data: savedData });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

//Get All Books==================================by kusum ============================================
const getAllBooks = async function (req, res) {
  try {
    let field = req.query;
    const { userId, category, subcategory } = field; //destructure

    //check userId

    //check the userId is valid
    if (userId) {
      if (!isValid) {
        return res
          .status(400)
          .send({ status: false, message: "UserId should  be present" });
      }
      if (!isValidId(userId)) {
        return res
          .status(404)
          .send({ status: false, message: "UserId is not valid" });
      }
    }

    //check the category value is present

    if (category) {
      if (!isValid) {
        return res
          .status(400)
          .send({ status: false, message: "category should  be present" });
      }
    }

    //check the subcategory value is present

    if (subcategory) {
      if (!isValid) {
        return res
          .status(400)
          .send({ status: false, message: "subcategory should  be present" });
      }
    }

    let filter = {
      ...field,
      isDeleted: false,
    };

    // get these field from bookModel book _id, title, excerpt, userId, category, releasedAt, reviews
    const Getbooks = await bookModel
      .find(filter)
      .select({
        title: 1,
        excerpt: 1,
        userId: 1,
        category: 1,
        subcategory: 1,
        reviews: 1,
        releasedAt: 1,
      })
      .sort({ title: 1 });

    if (Getbooks.length == 0)
      return res
        .status(404)
        .send({ status: false, message: "No Book is found" });

    return res
      .status(200)
      .send({ status: true, message: "Books list", data: Getbooks });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

// ---------------- get book by Id-------------------------------------------

const bookById = async function (req, res) {
  try {
    let bookId = req.params.bookId;

    // check for valid bookId
    if (!isValidId(bookId))
      return res
        .status(400)
        .send({ status: false, message: "Invalid bookId!" });

    let book = await bookModel
      .findOne({ _id: bookId, isDeleted: false })
      .lean();
    if (!book)
      return res
        .status(404)
        .send({ status: false, message: "No book with this bookId exists" });

    // fetch
    let result = await reviewModel
      .find({ bookId: bookId, isDeleted: false })
      .select({ isDeleled: 0, createdAt: 0, updatedAt: 0 });

    book.reviewsData = result;

    return res
      .status(200)
      .send({ status: true, message: "Book details", data: book });
  } catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
};

// ---------------------- Update by BookId ------------------------------------------------

const updateBook = async function (req, res) {
  try {
    // fetching BookId from params
    const bookId = req.params.bookId;

    //  validating bokkId

    if (!isValidId(bookId)) {
      return res
        .status(400)
        .send({ status: false, message: "Invalid book id" });
    }

    let book = await bookModel.findOne({ _id: bookId, isDeleted: true });
    if (!book)
      return res
        .status(400)
        .send({ status: false, message: "No Books exits with this bookId" });

    // validating request body

    if (!isValidBody(req.body))
      return res
        .status(400)
        .send({ status: false, message: "All fields are required" });

    const reqBody = req.body;
    const { title, excerpt, releasedAt, ISBN } = reqBody; // destructure

    // validating title
    if (title) {
      if (!isValidBookTitle(title.trim()))
        return res
          .status(400)
          .send({ status: false, message: "title should be a valid format" });
    }

    let checkTitle = await bookModel.findOne({ title });
    if (checkTitle)
      return res
        .status(409)
        .send({ status: false, message: `'${title}' is already taken` });

    //  validating title
    if (ISBN) {
      if (!isValidISBN(ISBN.trim()))
        return res
          .status(400)
          .send({ status: false, message: "ISBN should be a valid format" });
    }
    let checkISBN = await bookModel.findOne({ ISBN });
    if (checkISBN)
      return res.status(409).send({
        status: false,
        message: `ISBN '${req.body.ISBN}' already exist`,
      });

    //  validating date
    if (releasedAt) {
      if (!isValidReleasedAt(releasedAt))
        return res.status(400).send({
          status: false,
          message: "ReleasedAt should be a valid format",
        });
    }

    //  validating excerpt
    if (excerpt) {
      if (!isValidName(excerpt.trim()))
        return res
          .status(400)
          .send({ status: false, message: "excerpt should be a valid format" });
    }

    // update book document
    let updateBook = await bookModel.findOneAndUpdate(
      { _id: bookId, isDeleled: false },
      {
        $set: {
          title: title,
          excerpt: excerpt,
          releasedAt: new Date(),
          ISBN: ISBN,
        },
      },
      { new: true }
    );

    return res.status(200).send({
      status: true,
      message: "Book Updated Successfully",
      data: updateBook,
    });
  } catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
};

// ------------------- delete by blogId --------------------------------------

const deleteBookById = async function (req, res) {
  try {
    let bookId = req.params.bookId;

    // validating bookId

    if (!isValidId(bookId)) {
      return res.status(400).send({ status: false, message: "Invalid BookId" });
    }

    //  search for document isn't deleted
    let checkBook = await bookModel.findOne({ _id: bookId, isDeleted: false });

    if (!checkBook) {
      return res
        .status(404)
        .send({ status: false, message: "book not found or already deleted" });
    }

    // delete document
    let updateBook = await bookModel.findOneAndUpdate(
      { _id: bookId },
      {
        isDeleted: true,
        deletedAt: new Date(),
      },
      { new: true }
    );

    return res
      .status(200)
      .send({ status: true, message: "sucessfully deleted" });
  } catch (error) {
    res.status(500).send({ status: false, error: error.message });
  }
};

module.exports = {
  bookById,
  createBook,
  getAllBooks,
  updateBook,
  deleteBookById,
};
