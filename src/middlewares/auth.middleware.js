import jwt from "jsonwebtoken";
import {asyncHandler} from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"

export const verifyJwt = asyncHandler( async (req, res, next) => {
    const recievedAccessToken = req.cookies.accessToken || req.headers?.authorization?.replace('Bearer ','').trim();
    
    if(!recievedAccessToken){
        throw new ApiError(401, "No Token Found [IN COOKIES");
    }

    let decodedAccessToken;
    try{
        decodedAccessToken = jwt.verify(recievedAccessToken, process.env.ACCESS_TOKEN_SECRET);
    } catch(err){
        throw new ApiError(401, `JWT Token Verification Failed : ${err.name} : ${err.message}`);
    }

    const user = await User.findById(decodedAccessToken?._id);
    
    if(!user){
        throw new ApiError(401, "Invalid Token [NO USER FOUND]");
    }
    req.user = user;
    next();
});

