import {Schema, model} from "mongoose";

const todoListSchema = new Schema({
    title:{
        type: String,
        required: [true, "Title is neccessary"],
    },
    description:{
        type: String
    },
    admins:{
        type: [
            {
                type: Schema.Types.ObjectId,
                ref: "users",
            }
        ],
        required: [
            function() {
                return this.admins.length != 0;
            },
            "Todolist Without admin is not possible"
        ]
    },
    tasks:{
        type: [
            {
                type: Schema.Types.ObjectId,
                ref: "tasks",
            }
        ]
    },
    sharedToWrite:[String],
    sharedToRead:[String],
    SharedToPartialWrite:[String],
},{timestamps: true});


export const TodoList = model("todolists",todoListSchema);