import { Schema, model } from "mongoose";

const requestSchema = new Schema({
    invitee: {
        type: Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    inviter: {
        tyPe: Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    taskListId: {
        type: Schema.Types.ObjectId,
        ref: "tasklists",
        required: true,
    },
    status: {
        type: String,
        enum: ["pending", "accepted", "rejected", "rescinded"],
        default: "pending",
    },
    role:{
        type: String,
        enum: ["editor", "viewonly", "admin"],
        default: "viewonly",
        required: true
    },
    comment: {
        request: {
            type: String,
            default: null
        },
        response: {
            type: String,
            default: null
        },
    },
}, { timestamps: true });

export const Request = model("requests", requestSchema);