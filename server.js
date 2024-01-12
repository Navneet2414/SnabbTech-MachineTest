const express= require('express');
const mongoose = require('mongoose');
const Port = 4000;
const app = express();
const router = express.Router();
const bodyparser = require("body-parser");
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());
const userRoute = require('./route/userRoutes');
app.use("/api/snabbTech",userRoute);
const db = require("./common/connection");


app.listen(Port,async()=>{
    console.log(`Server is running on port ${Port}....`);
})