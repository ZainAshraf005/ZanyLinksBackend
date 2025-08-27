import express, { urlencoded } from "express";
import dotenv from "dotenv";
import connectDB from "./config/mongodb.js";
import errorMiddleware from "./middlewares/errorMiddleware.js";
import authRouter from "./route/authRoute.js";
import linksRouter from "./route/socialLinksRoute.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config({});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const corsOptions = {
  origin: process.env.CLIENT_HOST,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
};
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(cors(corsOptions));
app.use(urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.json());
app.use(errorMiddleware);

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Multer-specific errors
    res.status(400).json({ error: err.message });
  }
});

app.use("/api/auth", authRouter);
app.use("/api/links", linksRouter);

const port = process.env.PORT;

app.listen(port, () => {
  connectDB();
  console.log(`server is running on port: ${port}`);
});
