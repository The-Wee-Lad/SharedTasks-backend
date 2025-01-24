import {Schema, model} from "mongoose";

const taskSchema = new Schema({
    title:{
        type:String,
        required:true,
    },
    description: {
        type: String,
    },
    expiresIn: {
        type:{
            is: Boolean,
            in: Date
        },
        default: {
            is: true,
            in: null
        }
    },
    done:{
        type: Boolean,
        default: false,
    },
    whenDone: {
        type:Date,
    },
    assignedTo: [
        {
            type: Schema.Types.ObjectId,
            ref:"users",
        }
    ],
    createdBy : {
        type: Schema.Types.ObjectId,
        ref: "users"
    }
},{timestamps: true});

export const Task = model("tasks",taskSchema);