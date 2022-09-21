const mongosse = require('mongoose')
const bookModel = require('../model/bookModel')
const userModel = require('../model/userModel')
const reviewModel = require("../model/reviewModel")
const { isValidName, isValidBody, isValidId, isValidISBN, isValidReleasedAt } = require("../validators/validator");



// ------------------- creating book -----------------------------------
const createBook = async (req, res) => {
    try {
        // Validating request body

        if (!isValidBody(req.body)) return res.status(400).send({ status: false, message: "All fields are required" });

        let { title, excerpt, userId, ISBN, category, subcategory, releasedAt } = req.body;

        // title validation

        if (!title || !isValidName(title.trim())) return res.status(400).send({ status: false, message: 'title is required and should be a valid format' });
        let checkTitle = await bookModel.findOne({ title: title });
        if (checkTitle) return res.status(409).send({ status: false, message: `'${title}' is already taken` });


        // excerpt validation

        if (!excerpt || !isValidName(excerpt.trim()))
            return res.status(400).send({ status: false, message: 'excerpt is required and should be a valid format' });

        // userId validtion

        if (!userId)
            return res.status(400).send({ status: false, message: "Please enter userId" });

        if (typeof userId != "string" || !isValidId(userId))
            return res.status(400).send({ status: false, message: "Please enter valid userId" });

        let checkUser = await userModel.findOne({ _id: userId });
        if (!checkUser)
            return res.status(400).send({ status: false, message: "User is not present" });

        // if (userId != req.token.userId)
        //     return res.status(400).send({ status: false, message: "You are not authorized" });


        if (!ISBN)
            return res.status(400).send({ status: false, message: "Please enter ISBN" });

        if (typeof ISBN != "string" || !isValidISBN(ISBN))
            return res.status(400).send({ status: false, message: "Please enter valid ISBN " });

        let checkISBN = await bookModel.findOne({ ISBN: ISBN });
        if (checkISBN)
            return res.status(400).send({ status: false, message: `ISBN '${req.body.ISBN}' already exist` });

        // category validation
        if (!category)
            return res.status(400).send({ status: false, message: "Please enter category" });

        if (!isValidName(category))
            return res.status(400).send({ status: false, message: "Please enter valid Category" });

        // subcategory validation
        if (!subcategory)
            return res.status(400).send({ status: false, message: "Please enter subcategory" });

        if (!isValidName(subcategory))
            return res.status(400).send({ status: false, message: "Please enter valid subcategory" });

        // released date validation
        if (!releasedAt)
            return res.status(400).send({ status: false, message: "Please enter release date" });

        if (!isValidReleasedAt(releasedAt))
            return res.status(400).send({ status: false, message: "Please enter valid release date in YYYY-MM-DD format" });

        // creating new book
        const savedData = await bookModel.create(req.body);
        return res.status(201).send({ status: true, message: "Sucessfully created", data: savedData });

    } catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
}


//Get All Books==================================by kusum ============================================
const getAllBooks = async function (req, res) {
    try {
        let field = req.query;
        const { userId, category, subcategory } = field //destructure

        //check userId

        //check the userId is valid
        if (userId !== undefined) {
            if (userId.length === 0) {
                return res.status(400).send({ status: false, message: "UserId should  be present" })
            }
            if (!isValidId(userId)) {
                return res.status(404).send({ status: false, message: "UserId is not valid" })
            }
        }

        //check the category value is present

        if (category !== undefined) {
            if (category.length === 0) {
                return res.status(400).send({ status: false, message: "category should  be present" })
            }
        }

        //check the subcategory value is present

        if (subcategory !== undefined) {
            if (subcategory.length === 0) {
                return res.status(400).send({ status: false, message: "subcategory should  be present" })
            }
        }

        let filter = {
            ...field,
            isDeleted: false
        };

        // get these field from bookModel book _id, title, excerpt, userId, category, releasedAt, reviews 
        const Getbooks = await bookModel.find(filter)
            .select({ title: 1, excerpt: 1, userId: 1, category: 1, reviews: 1, releasedAt: 1 });

        if (Getbooks.length == 0)
            return res.status(404).send({ status: false, message: "No Book is found" });

        //sort alphabetically
        Getbooks.sort(function (a, b) {
            const nameA = a.title;
            const nameB = b.title;
            if (nameA < nameB) { return -1; }
            if (nameA > nameB) { return 1; }
            return 0;
        });

        return res.status(200).send({ status: true, message: 'Books list', data: Getbooks })

    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
};


// ---------------- get book by Id-------------------------------------------
const bookById = async function (req, res) {

    try {
        let bookId = req.params.bookId
        if (!isValidId(bookId)) return res.status(400).send({ status: false, message: "Invalid bookId!" })

        let book = await bookModel.findOne({ _id: bookId })
        if (!book) return res.status(400).send({ status: false, message: "No book with this bookId exists" })

        let result = await reviewModel.find().populate('bookId')

        return res.status(400).send({ status: true, message: "Book details", data: result })
    }
    catch (error) {
        res.status(500).send({ status: false, message: error.message })
    }
}


// ----------------------put api ------------------------------------------------
const updateBook = async function (req, res) {
    try {
        const bookId = req.params.bookId;
        if (!isValidId(bookId)) {
            return res.status(400).send({ status: false, message: "Invalid book id" })
        }

        let book = await bookModel.findOne({ _id: bookId })
        if (!book) return res.status(400).send({ status: false, message: "No Books exits with this bookId" })


        const reqBody = req.body;
        const { title, excerpt, releasedAt, ISBN } = reqBody;

        let isUpdateRequired = false
        const updateQuery = {
            $set: {},
            $push: {}
        };

        if (isValidName(title)) {
            updateQuery['$set']['title'] = title
            isUpdateRequired = true
        }
        if (isValidName(excerpt)) {
            updateQuery['$set']['excerpt'] = excerpt
            isUpdateRequired = true
        }
        if (isValidReleasedAt(releasedAt)) {
            updateQuery['$set']['releasedAt'] = releasedAt
            isUpdateRequired = true
        }
        if (isValidISBN(ISBN)) {
            updateQuery['$set']['ISBN'] = ISBN
            isUpdateRequired = true
        }
        if (isUpdateRequired) {
            updateQuery['$set']['isPublished'] = true
            updateQuery['$set']['publishedAt'] = new Date()
        }

        const updatedBook = await bookModel.findOneAndUpdate(
            {
                _id: bookId,
                isDeleted: false
            },
            updateQuery,
            { new: true },
        )
        if (!updatedBook) {
            return res.status(404).send({ status: false, message: "Book not found" })
        }
        return res.status(200).send({ status: true, message: 'Book Updated Successfully', data: updatedBook })
    }
    catch (error) {
        res.status(500).send({ status: false, message: error.message })
    }
}


// ------------------- delete by blogId --------------------------------------

const deleteBookBYId = async function (req, res) {

    try {
        let bookId = req.params.bookId

        if (!isValidId(bookId)) {
            return res.status(400).send({ status: false, message: "Invalid BookId" });
        }

        let checkBook = await bookModel.findOne({ _id: bookId, isDeleted: false })

        if (!checkBook) {
            return res.status(404).send({ status: false, message: 'book not found or already deleted' })
        }

        let updateBook = await bookModel.findOneAndUpdate({ _id: bookId }, { isDeleted: true, deletedAt: new Date() }, { new: true })

        res.status(200).send({ status: true, message: 'sucessfully deleted' })

    } catch (error) {
        res.status(500).send({ status: false, error: error.message });
    }
}


module.exports = { bookById, createBook, getAllBooks, updateBook, deleteBookBYId }

