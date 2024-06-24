import express from "express";
import "dotenv/config";
import indexRouter from "./routes/index.js";
import cors from "cors"
import cookieParser from "cookie-parser";
import db from "./db/db.js";

const app = express();
const port = process.env.PORT || 4000

app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//routes
app.use("/", indexRouter);

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
})
