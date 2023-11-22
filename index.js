const mongoose= require("mongoose");
mongoose.connect("mongodb://127.0.0.1:27017/uml");
require("dotenv").config();
//
var compiler = require("compilex");

const express= require("express");
const app= express();

var cors = require('cors');
var option = {stats: true};
compiler.init(option);


//for user routes
const userRoute = require('./routes/userRoute');
app.use('/',userRoute);


app.listen(3000,function(){
    console.log("Server is running on port 3000");
})

compiler.flush(function(){
    console.log("All temporary files flushed !");
  });
  