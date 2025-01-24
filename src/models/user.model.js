import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new Schema({
    username:{
        type: String,
        required: [true, "Username Is Required"],
        unique: true,
    },
    email:{
        type: String,
        required: [true, "Email is requuired"],
        unique: true
    },
    fullname:{
        type: String,
        required: [true, "Full name required"],
    },
    password:{
        type: String,
        required: [true, "Password is neccessary"]
    },
    refreshToken: String,
    todoLists: {
        type: [
            {
                type: Schema.Types.ObjectId,
                ref: "todos",
            }
        ]
    },
    archives: {
        type: [
            {
                type: Schema.Types.ObjectId,
                ref: "todos",
            }
        ]
    },
    avatar: String,
    coverImage: String,
    isActive:{
        type : Boolean,
        default: false,
    }
},{timestamps: true});

userSchema.methods.passwordCheck = async function(password){
    return await bcrypt.compare(password,this.password);
};

userSchema.pre('save',async function(next){
    if(!this.isModified('password'))
        next();
    this.password = await bcrypt.hash(this.password,12);
    next();
});


export const User = mongoose.model("users", userSchema);
