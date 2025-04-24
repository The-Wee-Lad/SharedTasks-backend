import mongoose from "mongoose";
import { todoDB } from "../constant.js";
const connectDb = async () => {
    try {
        const connectionInstance = (await mongoose.connect(`${process.env.MONGO_URI}/${todoDB}`));
        const obj = connectionInstance.connection
        console.log("Connected to MongoDB server : ", obj.host);
    } catch (error) {
        console.log("Couldn't Establish Connection to Database. Error : ", error);
        process.exit(-1);
    }
};

export { connectDb };