const jwt = require("jsonwebtoken");
const bookModel = require("../model/bookModel");
const { isValidId } = require("../validators/validator");

// Authentication
const authenticate = async (req, res, next) => {
  try {
    let token = req.headers["x-api-key"] || req.headers["X-API-KEY"];

    // checking token

    if (!token)
      return res
        .status(401)
        .send({ status: false, msg: "token must be present" });

    // validating the token

    jwt.verify(token, "books_Management_Group_41", (err, decoded) => {
      if (err) {
        let message =
          err.message === "jwt expired"
            ? "token is expired"
            : "token is invalid";

        return res.status(401).send({ status: false, message: message });
      }

      // creating an attribute in "req" to access the decoded token outside the middleware

      req["decoded"] = decoded;

      next();
    });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

const authorise = async (req, res, next) => {
  try {
    let bookId = req.params.bookId;

    // validating bookId
    if(!isValidId(bookId))
    return res
        .status(400)
        .send({ status: false, message: "Invalid bookId" });

    // search userId for a given bookId
    let user = await bookModel.findOne({ _id: bookId });

    // check if book is available in book document
    if (!user)
      return res
        .status(404)
        .send({ status: false, message: "No book available with this bookId" });

    let seekingUser = user.userId.toString(); //person who want to access to resource
    let loggedInUser = req.decoded.userId;  //person who is loggedIn (has token)

    // comparing user who is logged in and who is working is same or not
    if (loggedInUser != seekingUser)
      return res.status(403).send({
        status: false,
        msg: "You are not authorised for this operation",
      });
    next();
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

module.exports = { authenticate, authorise };
