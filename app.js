import express from "express";
import "dotenv/config";
import cors from "cors";
import cookieParser from "cookie-parser";

import indexRouter from "./routes/index.js";
import db from "./db/db.js"; // Ensure this properly sets up the database connection

const app = express();
const port = process.env.PORT || 4000; // Default to port 3000 if PORT is not specified

// Middleware setup
app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/", indexRouter);

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
