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
        enum: ["editor", "view", "admin"],
        default: "viewonly",
        required: true
    },
});
collaboratorSchema.index({taskListId:1,userId:1},{unique:true});
export const Collaborator = mongoose.model("collaborators", collaboratorSchema);