import mongoose, {Schema, model} from "mongoose";

const taskListSchema = new Schema({
    title:{
        type: String,
        required: [true, "Title is neccessary"],
    },
    description:{
        type: String
    },
    createdBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: [true, "Who created This?"]
    }
    ,
    isArchived : {
        type: Boolean,
        default: false
    },
    public:{
        isPublic: {
            type: Boolean,
            default: false
        },
        role:{
            type: String,
            enum: ["edit", "view", "admin", ''],
            default: "view"
        }
    },
    dueDate:{
        type: Date,
        default: null
    },
    isCompleted:{
        type: Boolean,
        default: false
    },
},{timestamps: true});


export const TaskList = model("tasklists",taskListSchema);