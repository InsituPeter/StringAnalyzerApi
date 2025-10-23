require("dotenv").config()
//const path= require('path');

//const dotenv= require('dotenv');
const express= require('express');
const app= express();
const connectdb= require('./db');
const routes= require( "./route");
const errorHandler= require('./errorHandler');
const  rateLimit= require('express-rate-limit');
const { StatusCodes } = require('http-status-codes');

const limiter= rateLimit({
    windowMs: 15*60*1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
})
//configuration
/*const envFile= process.env.NODE_ENV 
          ? `.env.${process.env.NODE_ENV}`
          :`.env.development`;
dotenv.config({path: path.resolve(__dirname, envFile)});*/

const PORT= process.env.PORT 
//Middleware
app.use(express.json());
app.use(limiter);

app.use("/api/v1", routes);

app.get('/', (req, res)=>{
    res.send('Welcome to the String Analyzer Service API');
});

app.use(errorHandler);
app.use((req,res)=>{
    res.status(StatusCodes.NOT_FOUND).json("This route does not exist")
})

const start= async()=>{
    try{
      await connectdb(process.env.MONGO_URI);
      app.listen(PORT, ()=>{
          console.log(`Server is running on port ${PORT}...`);
      });
    }
    catch(error){
        console.log(error);
    }
}

start()