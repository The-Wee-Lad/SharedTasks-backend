import { User } from '../models/user.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { cookieOptions } from "../constant.js";
import { ApiResponse } from '../utils/ApiResponse.js';
import mongoose from 'mongoose';

const refreshAccessToken = asyncHandler( async (req, res) => {
    const refreshToken = req.cookies.refreshToken || req.headers?.authorization?.replace('Bearer ','').trim();
    
    if(!refreshToken){
        throw new ApiError(401, "No Token Found");
    }

    let decodedToken;
    try{
        decodedToken = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch(err){
        throw new ApiError(401, `JWT Refresh Token Verification Failed : ${err.name} : ${err.message}`);
    }
    
    const user = await User.findById(decodedToken?._id);
    
    if((user?.refreshToken !== refreshToken && user)){
        throw new ApiError(401,"Unauthorised Access");
    }

    const { newAccessToken, newRefreshToken }= await generateTokens(user._id);

    res
    .status(200)
    .cookie('accessToken',newAccessToken,cookieOptions)
    .cookie('refreshToken',newRefreshToken,cookieOptions)
    .json(new ApiResponse(200, {accessToken : newAccessToken,
        refreshToken: newRefreshToken}, "Access Token refreshed"));

});


const register = asyncHandler( async (req, res) => {
    const {username, email, password, fullname} = req.body;
    
    if([username, email, password, fullname].some((field) => !(field?.trim()))){
        throw new ApiError(400,"all fields are required");
    }


    //this is vulnerable to enumeration attacks 
    let user = await User.findOne({username : username});

    if(user){
        throw new ApiError(409,"Username Already Exists");
    }

    user = await User.findOne({email : email});
    
    if(email){
        throw new ApiError(409,"User with email already Exists");
    }

    user = await User.create({
        username : username,
        email : email,
        password : password,
        fullname : fullname,
    })

    const newUser = await User.findById(user?._id).select("-password");
    
    if(!newUser){
        throw new ApiError(500,"User Couldn't be created");
    }

    //TODO: Implement a email verification

    res.status(200).json(new ApiResponse(200,newUser,"User created succesfully"));
    console.log("User Registered");
    
});

const login = asyncHandler( async (req, res) => {
    const {usernameOrEmail, password} = req.body;
    
    if([usernameOrEmail, password].some((field) => !(field?.trim()))){
        throw new ApiError(400,"all fields are required");
    }
    
    const user = await User.findOne({$or:[{username : username}, {$and:[{email:email}, {isActive:true}]}]});
    if(!user || ! (await user?.passwordCheck(password))){
        throw new ApiError(401,"invalid credentials");
    }

    // if(user.createdAt >= Date)
    // Todo: Implement A date based email verification
    
    const {accessToken, refreshToken} = await generateTokens(user?._id);

    const data = User.findById(user?._id).select("-password");

    res
    .status(200)
    .cookie("accessToken", accessToken)
    .cookie("refreshToken", refreshToken)
    .json(new ApiResponse(200, data, "User logged in succesfully"));
});

const logout = asyncHandler( async (req, res) => {
    const user = await User.findByIdAndUpdate({_id:req.user?._id},
        {
            $unset: {refreshToken:""}
        }
    );

    if(!user || user.refreshToken){
        throw new ApiError(500,"Couldn't Log out");
    }

    res
    .status(200)
    .clearCookie("refreshToken",cookieOptions)
    .clearCookie("accessToken",cookieOptions)
    .json(new ApiResponse(200,{},"Looged out succesfully"));
});

const updateFullname = asyncHandler( async (req, res) => {
    
    const {fullname} = req.body;
    
    const user = await User.findById(req.User?._id).select("-password -refreshToken");
    
    if(!fullname){
        throw new ApiError(400,"FUllnaem can't be empty");
    }

    user.fullname = fullname;
    const newUser = await user.save();
    res.status(200).json(new ApiResponse(200,newUser,"Name Changed Succesfully"));

});


const changePassword = asyncHandler( async (req, res) => {
    const {oldPassword, newPassword, confirmPassword} = req.body;
    if(newPassword != confirmPassword){
        throw new ApiError(400,"Confirm Password doesn't match New Password");
    }
    const user = await User.findById(req.user?._id);
    if(!user.passwordCheck(oldPassword)){
        throw new ApiError(400,"Wrong Old Password");
    }
    
    user.password = newPassword;
    await user.save();
    const newUser = await User.findById(user.id).select("-password -refreshToken");
    res.status(200).json(new ApiResponse(200, newUser, "Pssword updated"));
});

const forgotPassword = asyncHandler( async (req, res) => {
    //isn't Possible without email verification
});

const updateEmail = asyncHandler( async (req, res) => {

    const {password, newEmail} = req.body;
    const user = User.findById(req.user?._id);
    if(!await user.passwordCheck(password)){
        throw new ApiError(401,"Wrong password");
    }

    if(await User.findOne({email:newEmail}))
        throw new ApiError(409, "Already In Use");

    //TODO: Setup a email sender for verification

});
//Though there is a field for avatar and cover, I don't see any reason to include them
//I thouht i should but it is not a social media thing
//eh, may be avtar acts as secondary form of recognition for users 

const getCurrentUser = asyncHandler( async(req, res) => {
    res
    .status(200)
    .json(new ApiResponse(200, await User.findById(req.user?._id)
    .select('-password -refreshToken'), "Current User Data Fetched"));
});

export {
    refreshAccessToken,
    register,
    login,
    logout,
    updateFullname,
    changePassword,
    forgotPassword,
    updateEmail,
    getCurrentUser,
}
