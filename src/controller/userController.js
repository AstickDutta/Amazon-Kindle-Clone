const mongoose = require("mongoose");
const userModel = require("../model/userModel");
const jwt = require("jsonwebtoken");

const {
  isValidTitle,
  isValidPassword,
  isValidName,
  isValidNumber,
  isValidEmail,
  isValidBody,
  isValidPincode,
  isValidBookTitle,
  isValid,
} = require("../validators/validator");

const registerUser = async function (req, res) {
  try {
    let data = req.body;

    // validating request body
    if (!isValidBody(data))
      return res
        .status(400)
        .send({ status: false, message: "All fields are required" });

    const { title, name, phone, email, password, address } = data; //destructure

    // validating title
    if (!title) {
      return res
        .status(400)
        .send({ status: false, message: "title is required " });
    }
    if (!isValid(title) || !isValidTitle(title)) {
      return res
        .status(400)
        .send({ status: false, message: "title should be a valid format-Mr, Mrs, Miss" });
    }

    // validating name
    if (!name) {
      return res
        .status(400)
        .send({ status: false, message: "name is required " });
    }
    if (!isValidName(name.trim())) {
      return res
        .status(400)
        .send({ status: false, message: "name should be a valid format" });
    }

    // validating phone
    if (!phone) {
      return res
        .status(400)
        .send({ status: false, message: "phone is required " });
    }
    if (!isValidNumber(phone)) {
      return res
        .status(400)
        .send({ status: false, message: "Enter valid phone number" });
    }
    // check if phone no already exist
    let validNumber = await userModel.findOne({ phone: phone });
    if (validNumber)
      return res
        .status(400)
        .send({ status: false, message: "This number is already registered" });

    // validating email
    if (!email) {
      return res
        .status(400)
        .send({ status: false, message: "email is required " });
    }
   if (!isValidEmail(email.trim())) {
      return res
        .status(400)
        .send({ status: false, message: "Enter valid emailId" });
    }
   // check if phone no already email
    let validEmail = await userModel.findOne({ email: email });
    if (validEmail)
      return res
        .status(400)
        .send({ status: false, message: "This email is already registered" });

      // validating password
    if (!password) {
      return res
        .status(400)
        .send({ status: false, message: "password is required" });
    }
    if (!isValidPassword(password.trim()))
      return res.status(400).send({
        status: false,
        msg: "Password must contain (8-15) characters, atleast One UpperCase , One LowerCase , One Numeric Value and One Special Character.",
      });

      // validating address
    if (address) {
      let valid = Object.keys(address);
      if (typeof address !== "object" || valid.length == 0)
        return res
          .status(400)
          .send({ status: false, message: "Please enter valid address" });

      let fill = valid.filter((element) =>
        ["street", "city", "pincode"].includes(element)
      );

      if (!fill.length)
        return res.status(400).send({
          status: false,
          message: "Please enter valid field in address (street,city,pincode)",
        });

      if (!address.street)
        return res
          .status(400)
          .send({ status: false, message: "Street is mandatory" });
      if (address.street) {
        if (!isValidBookTitle(address.street))
          return res.status(400).send({
            status: false,
            message: "Please enter valid Street number",
          });
      }

      if (!address.city)
        return res
          .status(400)
          .send({ status: false, message: "city is mandatory" });
      if (address.city) {
        if (!isValidName(address.city))
          return res
            .status(400)
            .send({ status: false, message: "Please enter valid city name" });
      }

      if (!address.pincode)
        return res
          .status(400)
          .send({ status: false, message: "pincode is mandatory" });
      if (address.pincode) {
        if (!isValidPincode(address.pincode))
          return res
            .status(400)
            .send({ status: false, message: "Please enter valid Pincode" });
      }
    }

    //now create the user:-
    let savedData = await userModel.create(data);
    return res
      .status(201)
      .send({ status: true, message: "created successfully", data: savedData });
  } catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
};

const userLogin = async (req, res) => {
  try {
    let data = req.body;

    // validating request body
    if (!isValidBody(data)) {
      return res
        .status(400)
        .send({ status: false, message: "enter user details" });
    }
    if (!data.email || !data.password) {
      return res
        .status(400)
        .send({ status: false, message: "email id and password is required " });
    }

    // check whether user is registered or not 
    const checkValidUser = await userModel.findOne({
      email: data.email,
      password: data.password,
    });

    if (!checkValidUser) {
      return res.status(401).send({
        status: false,
        message: "Email Id or password  is not correct",
      });
    }

    // generating token 
    let token = jwt.sign(
      { userId: checkValidUser._id },
      "books_Management_Group_41",
      { expiresIn: "1h" }
    );

    // setting token in header
    res.setHeader("x-api-key", token);
    return res
      .status(200)
      .send({ status: true, message: "Successfully Login", data: token });
  } 
  catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
};

module.exports = { registerUser, userLogin };
