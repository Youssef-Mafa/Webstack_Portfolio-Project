const express = require("express");
const dbconnect = require("./dbconnect/dbconnection");
const routes = require("./routes/routes.js");
const cors = require('cors');
require('dotenv').config();
console.log('JWT Secret:', process.env.JWT_SECRET);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use("/",routes);
app.get("/", (req, res) => {
    res.send("Hello World");
})
app.listen(process.env.PORT || 5000, () => {
    console.log(`Server running on ${process.env.PORT || 5000}`);
    dbconnect()
}); 
