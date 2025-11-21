import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/mongodb.js";
import authRouter from "./routes/authRoutes.js";

import transporter from "./config/nodemailer.js";
import userRouter from "./routes/userRoutes.js";

const app = express();

const port = process.env.PORT || 4000;

connectDB();

const allowedOrigins = ['http://localhost:5173']

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({origin:allowedOrigins, credentials: true }));

// Api endpoints

app.get("/", (req, res) => res.send("Api working"));
app.use("/api/auth", authRouter);

app.use("/api/user", userRouter);

app.listen(port, () => console.log(`Server started on PORT:${port}`));
