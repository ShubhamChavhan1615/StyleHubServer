import mongoose from "mongoose";

const localDb = process.env.LOCAL_DB;

const db = await mongoose.connect("mongodb+srv://shubhamchav1615:otcZQp2wbkKt5p6z@cluster0.n4u8tue.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0/Demo")
    .then(() => {
        console.log("connected to db");
    })
    .catch(err => {
        console.log(err);
    })

export default db;
