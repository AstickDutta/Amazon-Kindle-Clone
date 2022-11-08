const express = require('express');
const bodyParser = require('body-parser');
const route = require('./routes/route.js');
const { default: mongoose } = require('mongoose');
const app = express();

app.use(bodyParser.json());



mongoose.connect("mongodb+srv://kusum_99:9vJ9mxlJH1cYZ1oO@cluster0.jelghm1.mongodb.net/book-managment-db", {
    useNewUrlParser: true
})
.then( () => console.log("MongoDb is connected"))
.catch ( err => console.log(err) )

app.use('/', route);
app.use((req, res, next) => {
    res.status(400).send({ status: false, error: "Enter proper Url" });
})


app.listen(process.env.PORT || 3000, function () {
    console.log('Express app running on port ' + (process.env.PORT || 3000))
});