import { User } from '../models/user.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { cookieOptions, welcomeEmail, confirmationEmail } from "../constant.js";
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import jwt, { decode } from 'jsonwebtoken';
import { emailSender, messageCreater } from '../utils/email.util.js';

const sendConfirmationEmail = async (userId) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(404, "User Not Found [SENDING EMAIL FAILED]");
    }
    if (user.isActive) {
        throw new ApiError(409, "User Already Active [SENDING EMAIL FAILED]");
    }
    const confirmationToken = user.generateConfirmationToken();
    user.confirmationToken = confirmationToken;
    await user.save();
    let baseURL = `http://localhost:${process.env.PORT}`;
    if (process.env.NODE_ENV === "production") {
        baseURL = process.env.PROD_URL;
    }
    const confirmationLink = `${baseURL}/api/v1/user/confirm/${confirmationToken}`;
    const message = messageCreater(
        user?.email,
        "Welcome to Shared Tasks!",
        "You're officially part of Shared Tasks. Let's get started!",
        confirmationEmail(confirmationLink),
        [],
        { replyTo: "no-reply@zohomail.in" }
    );
    try {
        const result = await emailSender(message)
        if (result.status) {
            console.log("Email Sent Successfully")
        }
        else {
            console.log("Email Sending Failed")
            console.log("Error: ", result.error);
            console.log("Stack: ", result.stack);
            console.log("Code: ", result.code);
            console.log("Response: ", result.response);
            throw new ApiError(500, "Email Sending Failed");
        }
    }
    catch (error) {
        console.log("Error: ", error.message);
        console.log("Stack: ", error.stack);
        console.log("Code: ", error.code);
        console.log("Response: ", error.response);
        throw new ApiError(500, "Email Sending Failed");
    }
}

const generateTokens = async (userId) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(404, "User Not Found [GENERATION OF TOKENS FAILED");
    }
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save();
    return { accessToken, refreshToken };
}


const refreshAccessToken = asyncHandler(async (req, res) => {
    const refreshToken = req.cookies.refreshToken || req.headers?.authorization?.replace('Bearer ', '').trim();

    if (!refreshToken) {
        throw new ApiError(401, "No Token Found");
    }

    let decodedToken;
    try {
        decodedToken = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch (err) {
        throw new ApiError(401, `JWT Refresh Token Verification Failed : ${err.name} : ${err.message}`);
    }

    const user = await User.findById(decodedToken?._id);
    // console.log(user);

    if ((user?.refreshToken !== refreshToken && user)) {
        throw new ApiError(401, "Unauthorised Access");
    }

    const response = (await generateTokens(user._id));
    const { newAccessToken, newRefreshToken } = { newAccessToken: response.accessToken, newRefreshToken: response.refreshToken };
    // console.log(newAccessToken, newRefreshToken);
    res
        .status(200)
        .cookie('accessToken', newAccessToken, cookieOptions)
        .cookie('refreshToken', newRefreshToken, cookieOptions)
        .json(new ApiResponse(200, {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
        }, "Access Token refreshed"));

});

const register = asyncHandler(async (req, res) => {
    const { username, email, password, fullname } = req.body;

    console.log(username, email, password, fullname);

    if ([username, email, password, fullname].some((field) => !(field?.trim()))) {
        throw new ApiError(400, "all fields are required");
    }


    //this is vulnerable to enumeration attacks 
    let user = await User.findOne({ username: username });
    // console.log(user);
    if (user) {
        throw new ApiError(409, "Username Already Exists");
    }

    user = await User.findOne({ email: email });

    if (user) {
        throw new ApiError(409, "User with email already Exists");
    }

    user = await User.create({
        username: username,
        email: email,
        password: password,
        fullname: fullname,
    })

    const newUser = await User.findById(user?._id).select("-password");

    if (!newUser) {
        throw new ApiError(500, "User Couldn't be created");
    }

    //TODO: Implement a email verification

    res.status(200).json(new ApiResponse(200, newUser, "User created succesfully"));
    console.log("User Registered");

    sendConfirmationEmail(user?._id);
});

const login = asyncHandler(async (req, res) => {
    const { usernameOrEmail, password } = req.body;

    if ([usernameOrEmail, password].some((field) => !(field?.trim()))) {
        throw new ApiError(400, "all fields are required");
    }

    const user = await User.findOne({ $or: [{ username: usernameOrEmail }, { $and: [{ email: usernameOrEmail }, { isActive: true }] }] });
    if (!user || !(await user?.passwordCheck(password))) {
        throw new ApiError(401, "invalid credentials");
    }

    // if(user.createdAt >= Date)
    // Todo: Implement A date based email verification

    const { accessToken, refreshToken } = await generateTokens(user?._id);

    const data = await User.findById(user?._id).select("-password");

    res
        .status(200)
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .json(new ApiResponse(200, data, "User logged in succesfully"));
});

const logout = asyncHandler(async (req, res) => {
    const user = await User.findByIdAndUpdate({ _id: req.user?._id },
        {
            $unset: { refreshToken: "" }
        },
        { new: true }
    );

    if (!user || user.refreshToken) {
        throw new ApiError(500, "Couldn't Log out");
    }

    res
        .status(200)
        .clearCookie("refreshToken", cookieOptions)
        .clearCookie("accessToken", cookieOptions)
        .json(new ApiResponse(200, {}, "Looged out succesfully"));
    console.log("User Logged out");

});

const updateFullname = asyncHandler(async (req, res) => {

    const { fullname } = req.body;

    const user = await User.findById(req.user?._id).select("-password -refreshToken");

    // console.log(user);

    if (!fullname) {
        throw new ApiError(400, "FUllnaem can't be empty");
    }

    user.fullname = fullname;
    const newUser = await user.save();
    res.status(200).json(new ApiResponse(200, newUser, "Name Changed Succesfully"));

});


const changePassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    if (newPassword != confirmPassword) {
        throw new ApiError(400, "Confirm Password doesn't match New Password");
    }
    const user = await User.findById(req.user?._id);
    if (!user.passwordCheck(oldPassword)) {
        throw new ApiError(400, "Wrong Old Password");
    }

    user.password = newPassword;
    await user.save();
    const newUser = await User.findById(user.id).select("-password -refreshToken");
    res.status(200).json(new ApiResponse(200, newUser, "Pssword updated"));
});

const forgotPassword = asyncHandler(async (req, res) => {
    //isn't Possible without email verification
});

const updateEmail = asyncHandler(async (req, res) => {

    const { password, newEmail } = req.body;
    const user = await User.findById(req.user?._id);
    if (!await user.passwordCheck(password)) {
        throw new ApiError(401, "Wrong password");
    }

    if (await User.findOne({ email: newEmail }))
        throw new ApiError(409, "Already In Use");

    //TODO: Setup a email sender for verification

    res.status(200).json(new ApiResponse(200, {}, "Email Updated"));
    console.log("Email Updated");

});
//Though there is a field for avatar and cover, I don't see any reason to include them
//I thouht i should but it is not a social media thing
//eh, may be avtar acts as secondary form of recognition for users 

const getCurrentUser = asyncHandler(async (req, res) => {
    console.log("fetching user data");
    const user = await User.findById(req.user?._id).select("-password -refreshToken");
    // console.log(user);
    if (!user) {
        throw new ApiError(404, "User Not Found");
    }

    res
        .status(200)
        .json(new ApiResponse(200, user, "Current User Data Fetched"));
    console.log("Current User Fetched");
});

const confirmEmail = asyncHandler(async (req, res) => {
    const { confirmationToken } = req.params;
    if (!confirmationToken) {
        throw new ApiError(400, "Confirmation Token Not Found");
    }
    let decodedToken;
    try {
        decodedToken = jwt.verify(confirmationToken, process.env.CONFIRMATION_KEY);
    } catch (err) {
        throw new ApiError(401, `JWT Confirmation Token Verification Failed : ${err.name} : ${err.message}`);
    }

    const user = await User.findById(decodedToken?._id);
    if (!user) {
        throw new ApiError(404, "User Not Found [CONFIRMATION FAILED]");
    }
    if (user.isActive) {
        throw new ApiError(409, "User Already Active [CONFIRMATION FAILED]");
    }
    if (user.confirmationToken !== confirmationToken) {
        throw new ApiError(401, "Invalid Confirmation Token [CONFIRMATION FAILED]");
    }
    user.isActive = true;
    user.confirmationToken = undefined;
    await user.save();
    res.status(200).json(new ApiResponse(200, {}, "Email Confirmed"));
});

const resendConfirmationEmail = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user?._id);
    if (!user) {
        throw new ApiError(404, "User Not Found [RESEND EMAIL FAILED]");
    }
    if (user.isActive) {
        throw new ApiError(409, "User Already Active [RESEND EMAIL FAILED]");
    }
    sendConfirmationEmail(user?._id);
    res.status(200).json(new ApiResponse(200, {}, "Confirmation Email Sent"));
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
    confirmEmail,
    resendConfirmationEmail,
}
