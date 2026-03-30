import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRoute from "./router/users.js"
import assignmentRoute from "./router/assignment.js"
import excelImport from "./helper/excelImport.js"
import submissionRoute from './router/submission.js'
dotenv.config();

const app = express();
//////////////////////////////////
//cors 
app.use(cors({
    origin: [
        "http://localhost:5173",
        "https://your-frontend-url.onrender.com"
    ],
    credentials: true
}))
app.use(morgan('dev'))
app.use(express.json())
app.use(cookieParser());
//routers
app.use('/api', userRoute)
app.use('/api/teacher', assignmentRoute)
app.use('/api/excelUsers', excelImport)
app.use('/api/student', submissionRoute)

app.get('/', (req, res, next) => {
    res.send("Hello")
})
// mongodb url 
const mongoURL = process.env.Mongo_URL;


//mongoose
mongoose.connect(mongoURL).then(() => {
    console.log("Database connected");
    //port
    app.listen(process.env.PORT, () => {
        console.log('app is running on port ' + process.env.PORT);

    })
})