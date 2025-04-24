import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
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
    // todoLists: {
    //     type: [
    //         {
    //             type: Schema.Types.ObjectId,
    //             ref: "todos",
    //         }
    //     ]
    // },
    // archives: {
    //     type: [
    //         {
    //             type: Schema.Types.ObjectId,
    //             ref: "todos",
    //         }
    //     ]
    // },
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

userSchema.methods.generateAccessToken = function () {
    return jwt.sign({
        _id: this._id,
        email: this.email,
        username: this.username,
        fullname: this.fullname
    },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    );
};
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign({
        _id: this._id,
    },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
        }
    );
};



export const User = mongoose.model("users", userSchema);
