const express = require('express');
const router = express.Router();
const authorController=require('../controllers/authorController')
const blogController = require('../controllers/blogController')
const auth = require('../middlewares/auth')
const validators = require('../validators/validator')


// dummy 
router.get("/test-me", function (req, res) {
    res.send("My first ever api!")
})

module.exports = router