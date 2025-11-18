import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/mongodb.js";
import authRouter from './routes/authRoutes.js'


import transporter from "./config/nodemailer.js"; 

const app = express();


const port = process.env.PORT || 4000;

connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({ credentials: true }));


// Api endpoints


app.get("/", (req, res) => res.send("Api working"));
app.use('/api/auth',authRouter)



app.listen(port, () => console.log(`Server started on PORT:${port}`));
