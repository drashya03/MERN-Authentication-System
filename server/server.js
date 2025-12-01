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
app.set('trust proxy', 1);
const port = process.env.PORT || 4000;

connectDB();



app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


const allowedOrigins = [
  "http://localhost:5174",
   process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));


// app.use(cors({
//   origin: [
//     "http://localhost:5173",
//      process.env.FRONTEND_URL
//   ],
//   methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
//   allowedHeaders: ["Content-Type", "Authorization"],
//   credentials: true
// }));

// app.options("*", cors());


// Api endpoints

app.get("/", (req, res) => res.send("Api working"));
app.use("/api/auth", authRouter);

app.use("/api/user", userRouter);

app.listen(port, () => console.log(`Server started on PORT:${port}`));
