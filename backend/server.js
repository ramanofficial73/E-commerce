const app = require('./app')
const dotenv = require("dotenv")
const connectDatabase = require("./config/database")
const cloudinary = require("cloudinary")


//handkling uncought Exception
process.on(`uncaughtException`, (err)=>{
    console.log(`Error : ${err.message}`);
    console.log(`Shutting Down the server due to Unhandled Uncought Exception `)
   process.exit(1)

})

// console.log(hii)


//config
dotenv.config({path:"backend/config/config.env"})

//connecting t database
connectDatabase();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key : process.env.CLOUDINARY_API_KEY,
    api_secret : process.env.CLOUDINARY_API_SECRET
})

const server = app.listen(process.env.PORT,()=>{
    console.log(`Server is working on http://localhost:${process.env.PORT}`)
})





//unhandleed Promiss Rejections
process.on("unhandledRejection", err=>{
    console.log(`Errror : ${err.message}`);
    console.log(`Shutting Down the server due to Unhandled Promiss Rejection `)

   server.close(()=>{
       process.exit(1)
   })
})