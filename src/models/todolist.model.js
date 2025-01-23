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
    sharedToWrite:{},
    sharedToRead:{},
    SharedToPartialWrite:{},
    isArchived:{
        type: Boolean,
        default: false,
    },
},{timestamps: true});


export const todoList = model("todolists",todoListSchema);