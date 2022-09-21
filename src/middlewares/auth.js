const jwt = require("jsonwebtoken");

// Authentication
const authenticate = async (req, res, next) => {
    try {
        let token = req.headers["x-api-key"] || req.headers["X-API-KEY"];

        // checking token

        if (!token)
            return res.status(401).send({ status: false, msg: "token must be present" });

        // validating the token

        jwt.verify(token, "books_Management_Group_41", (err, decoded) => {
            if (err) {
                let message =
                    err.message === "jwt expired" ? "token is expired" : "token is invalid";

                return res.status(401).send({ status: false, message: message });
            }
            else {
                // creating an attribute in "req" to access the token outside the middleware

                req.token = decoded;
                next();
            }
        });
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
};


const authorise = async (req, res, next) => {
    try {
        let bookId = req.params.bookId   //person who want to access to resource
        let loggedInUser = req.token.bookId   //person who is loggedIn (has token)

        if (loggedInUser != bookId) return res.status(403).send({ status: false, msg: "You are not authorised for this operation" })
    }
    catch (error) {
        res.status(500).send({ message: error.message })
    }
}

module.exports = { authenticate, authorise }
