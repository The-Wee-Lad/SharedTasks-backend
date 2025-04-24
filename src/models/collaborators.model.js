import mongoose,{Schema} from "mongoose";

const collaboratorSchema = new Schema({
    taskListId:{
        type: Schema.Types.ObjectId,
        ref: "tasklists",
        required: true
    },
    userId:{
        type: Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    role:{
        type: String,
        enum: ["editor", "viewonly", "admin"],
        default: "viewonly",
        required: true
    },
});