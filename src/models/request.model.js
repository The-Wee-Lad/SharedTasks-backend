import { Schema, model } from "mongoose";

const requestSchema = new Schema({
    from: {
        type:{
            type: Schema.Types.ObjectId,
            ref: "users",
        },
        required: true
    },
    to: {
        type:{
            type: Schema.Types.ObjectId,
            ref: "users",
        },
        required: true
    },
    todolist: {
        type: [
            {
                type: Schema.Types.ObjectId,
                ref: "todos",
            }
        ],
        required: true,
    },
    role: {
        type: String,
        enum: ["write", "read", "partial_write", "admin"]
    },
    status: {
        type: String,
        enum: ["pending", "accepted", "rejected"],
    }
},{timestamps: true});

export const Request = model("requests", requestSchema);