const express = require('express');
const router = express.Router();
const userController = require('../controller/userController')
// const bookController = require('../controller/bookController')



// dummy 
router.get("/test-me", function (req, res) {
    res.send("My first ever api!")
})


// ------------ Creating user ------------------------
router.post("/register",userController.registerUser )

module.exports = router