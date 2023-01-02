const express = require('express');
const app = express();
const mongoose = require("mongoose");
const bodyparser = require("body-parser");
const cors = require("cors");
require('dotenv/config');

app.use(cors());
app.use(bodyparser.json());

//route
const postroute = require("./routes/post");

app.use("/posts",postroute);

app.get("/",(req,res)=>{
    res.send("Main page")
})
 
//Database connection
mongoose.connect(process.env.DB_connect,
    { useNewUrlParser:true},
    () => console.log("DB connected")
)

app.listen(3000);
