import {Schema, model} from "mongoose";

const taskSchema = new Schema({
    title:{
        type:String,
        required:true,
    },
    description: {
        type: String,
    },
    taskListId:{
        type: Schema.Types.ObjectId,
        ref: "tasklists",
        required:true,
    },
    status:{
        type: String,
        enum: ["todo", "in-progress", "done"],
        default: "todo",
    },
    priority:{
        type: String,
        enum: ["low", "medium", "high"],
        default: "low",
    },
    dueDate:{
        type: Date,
        default: null,
    }
},{timestamps: true});

export const Task = model("tasks",taskSchema);