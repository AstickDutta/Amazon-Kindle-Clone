const mongoose = require('mongoose')
const userModel = require('../model/userModel')
const jwt = require("jsonwebtoken")

const { isValidTitle, isValidPassword, isValidName, isValidNumber, isValidEmail, isValidBody, isValidPincode } = require('../validators/validator')



const registerUser = async function (req, res) {
    try {
        let data = req.body

        if (!isValidBody(data))
            return res.status(400).send({ status: false, message: "All fields are required" })

        const { title, name, phone, email, password, address } = data;

        if (!title || !isValidTitle(title.trim())) 
            return res.status(400).send({ status: false, message: 'title is required and should be a valid format' })


        if (!name || !isValidName(name.trim()))
            return res.status(400).send({ status: false, message: 'name is required and should be a valid format' })
       

        if (!phone || !isValidNumber(phone.trim()))
            return res.status(400).send({ status: false, message: 'phone is required and number should be a valid format -starts from 6,7,8,9' })
        let validNumber = await userModel.findOne({ phone: phone })
        if (validNumber)
            return res.status(400).send({ status: false, message: "This number is already registered" })

        // if (!email || !isValidEmail(email.trim()))
        if (!(/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(data.email)))
          return res.status(400).send({ status: false, message: 'email is required and email should be a valid format' })



        let validEmail = await userModel.findOne({ email: email })
        if (validEmail)
            return res.status(400).send({ status: false, message: "This email is already registered" })

        if (!password || !isValidPassword(password.trim()))
            return res.status(400).send({ status: false, msg: 'password is required and  must contain atleast One UpperCase , One LowerCase , One Numeric Value and One Special Character.' })

        if (address) {
            let valid = Object.keys(address)
            if (typeof address !== "object" || valid.length == 0) return res.status(400).send({ status: false, message: "Please enter valid address" });

            let fill = valid.filter((element) =>
                ["street", "city", "pincode"].includes(element));

            if (!fill.length)
                return res.status(400).send({ status: false, message: "Please enter valid field in address (street,city,pincode)" });

            if (!address.street) return res.status(400).send({ status: false, message: "Street is mandatory" })
            if (address.street) {
                if (!isValidName(address.street))
                    return res.status(400).send({ status: false, message: "Please enter valid Street number" });
            }

            if (!address.city) return res.status(400).send({ status: false, message: "city is mandatory" })
            if (address.city) {
                if (!isValidName(address.city))
                    return res.status(400).send({ status: false, message: "Please enter valid city name" });
            }

            if (!address.pincode) return res.status(400).send({ status: false, message: "pincode is mandatory" })
            if (address.pincode) {
                if (!isValidPincode(address.pincode))
                    return res.status(400).send({ status: false, message: "Please enter valid Pincode" });
            }
        }


        //now create the user:-  
        let savedData = await userModel.create(data)
        return res.status(201).send({ status: true, message: "created successfully", data: savedData })
    }
    catch (error) {
        res.status(500).send({ status: false, message: error.message })
    }
}


const userLogin = async (req, res) => {

    try {
        let data = req.body;

        if (!isValidBody(data)) {
            return res.status(400).send({ status: false, message: "enter user details" });
        }
        if (!data.email || !data.password) {
            return res.status(400).send({ status: false, message: "email id and password is required " });
        }

        const checkValidUser = await userModel.findOne({ email: data.email, password: data.password });

        if (!checkValidUser) {
            return res.status(401).send({ status: false, message: "Email Id or password  is not correct" });
        }

        let token = jwt.sign({ userId: checkValidUser._id },
            "books_Management_Group_41",
            { expiresIn: '1hr' });

        res.setHeader('x-api-key', token);
        return res.status(200).send({ status: true, message: "Successfully Login", data: token });

    } catch (error) {
        res.status(500).send({ status: false, message: error.message });
    }
}







module.exports = { registerUser, userLogin };

