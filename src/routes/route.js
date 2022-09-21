const express = require('express');
const router = express.Router();
const userController = require('../controller/userController')
const bookController = require('../controller/bookController')
const auth = require("../middlewares/auth")



// dummy 
router.get("/test-me", function (req, res) {
    res.send("My first ever api!")
})


// ------------ Creating user ------------------------
router.post("/register",userController.registerUser )

// ------------ login for user ----------------------
router.post("/login", userController.userLogin)

// ----------- creating book ------------------------
router.post("/books",auth.authenticate, bookController.createBook)

// ------------ get book by query filters ------------
router.get("/books", auth.authenticate, bookController.getAllBooks)

// ------------ get books by BookId ------------------
router.get("/books/:bookId",auth.authenticate, bookController.bookById)

// ------------ update book by BookId -------------------------
router.put("/books/:bookId",auth.authenticate, auth.authorise, bookController.updateBook)

// ------------- delete by BookId -------------------
router.delete("/books/:bookId",auth.authenticate, auth.authorise,  bookController.deleteBookBYId)


module.exports = router