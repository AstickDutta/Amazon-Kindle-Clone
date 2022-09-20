const mongoose = require('mongoose')
const userModel = require('../model/userModel')
const { isValidTitle, isValidPassword, isValidName, isValidNumber, isValidEmail, isValidBody } = require('../validators/validator')

const registerUser = async function (req, res) {
    try {
        let requestBody = req.body
        if (!isValidBody(requestBody)) return res.status(400).send({ status: false, message: "All fields are required" })

        const { title, name, phone, email, password, address } = requestBody;

        if (!title || !isValidTitle(title.trim())) return res.status(400).send({ status: false, message: 'title is required and should be a valid format' })

        if (!name || !isValidName(name.trim())) return res.status(400).send({ status: false, message: 'name is required and should be a valid format' })

        if (!phone || !isValidNumber(phone.trim())) return res.status(400).send({ status: false, message: 'phone is required and number should be a valid format -starts from 6,7,8,9' })
        let validNumber = await userModel.findOne({ phone: phone })
        if (validNumber) return res.status(400).send({ status: false, message: "This number is already registered" })

        if (!email || !isValidEmail(email.trim())) return res.status(400).send({ status: false, msg: 'email is required and number should be a valid format' })
        let validEmail = await userModel.findOne({ email: email })
        if (validEmail) return res.status(400).send({ status: false, message: "This email is already registered" })

        if (!password || !isValidPassword(password.trim())) return res.status(400).send({ status: false, msg: 'password is required and number should be a valid format' })


        //now create the user:-  
        let savedData = await userModel.create(requestBody)
        return res.status(201).send({ status: true, message: "created successfully", data: savedData })
    } catch (error) {
        res.status(500).send({ status: false, message: error.message })
    }
}


const userLogin = async (req, res) => {

    try {
        let data = req.body;

        if (! isValidBody(data)) {
            return res.status(400).send({ status: false, message: "enter user details" });
        }
        if (!data.email || !data.password) {
            return res.status(400).send({ status: false, message: "email id and password is required " });
        }

        const checkValidUser = await userModel.findOne({ email: data.email, password: data.password });

        if (!checkValidUser) {
            return res.status(401).send({ status: false, message: "Email Id or password  is not correct" });
        }

        let token = jwt.sign({ userId: checkValidUser._id }, "books_Management_Group_41", { expiresIn: '10d' });

        res.setHeader('x-api-key', token);
        return res.status(200).send({ status: true, message: "Successfully Login", data: token });

    } catch (error) {
        res.status(500).send({ status: false, message: error.message });
    }
}


module.exports = { userLogin };



module.exports.registerUser = registerUser