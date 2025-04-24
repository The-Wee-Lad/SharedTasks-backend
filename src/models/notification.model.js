import mongoose,{Schema} from "mongoose";

const notificationSchema = new Schema({
    userId:{
        type:Schema.Types.ObjectId,
        ref:"users",
    },
    status: {
        type: String,
        enum: ['unread', 'read'],
        required: true,
        default: 'unread',
    },
    message: {
        type: String,
        required: true,
    },
});

export const Notification = mongoose.model("notifications",notificationSchema);