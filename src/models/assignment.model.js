import mongoose,{Schema} from "mongoose";

const assignmentSchema = new Schema({
    taskId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "tasks",
        required: true
    },
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    assignedBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        // required: true
    },
});

export const Assignment = mongoose.model("assignments", assignmentSchema);