import mongoose from "mongoose";

const localDb = process.env.LOCAL_DB;

const db = await mongoose.connect(localDb)
    .then(() => {
        console.log("connected to local db");
    })
    .catch(err => {
        console.log(err);
    })

export default db;