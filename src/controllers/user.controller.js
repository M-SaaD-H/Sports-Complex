import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/apiError.js"
import { ApiResponse } from "../utils/apiResponse.js"
import { User } from "../models/user.model.js"
import { OTPVerification } from "../models/otpVerification.model.js";
import { sendOTPEmail, sendResetOTPEmail } from "../utils/nodemailer.js";

const cookieOptions = {
    httpOnly: true,
    secure: true
}

const generateAccessAndRefreshTokens = async (userID) => {
    try {
        const user = await User.findById(userID);

        if(!user) {
            throw new ApiError(404, "User not found");
        }

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken }
    } catch (error) {
        throw new ApiError(500, "Error while generating access and refresh tokens");
    }
}

const generateOTP = async (email) => {
    const existingOTPRequest = await OTPVerification.findOne({ email });

    if(existingOTPRequest) await existingOTPRequest.deleteOne();

    const OTP = Math.floor(100000 + Math.random() * 900000);

    await OTPVerification.create({
        email,
        OTP,
        expiresAt: Date.now() + 5 * 60 * 1000 // OTP expires in 5 minutes
    });

    return OTP;
}

const registerUser = asyncHandler( async (req, res) => {
    const { name, email, password, gender, role } = req.body;

    if(
        [name, email, password, gender, role].some((field) => field.trim() === "")
    ) {
        throw new ApiError(404, "All fields are required");
    }

    if(!email.includes('@iitjammu.ac.in')) {
        throw new ApiError(400, "Email is invalid");
    }

    const existingUser = await User.findOne({email})

    if(existingUser) {
        throw new ApiError(4001, "Email address already registered");
    }

    // Now send OTP via email

    const OTP = await generateOTP(email);

    sendOTPEmail(OTP, email);

    return res
    .status(200)
    .json(
        new ApiResponse(200, {}, "OTP sent successfully")
    )
});

const verifyOTPAndCreateUser = asyncHandler( async (req, res) => {
    const { name, email, password, role, gender, OTP } = req.body;
    
    if(
        [name, email, password, gender, role].some((field) => field.trim() === "")
    ) {
        throw new ApiError(404, "All fields are required");
    }
    
    if(!email.includes('@iitjammu.ac.in')) {
        throw new ApiError(400, "Email is invalid");
    }
    
    const storedOTPVerificationInstance = await OTPVerification.findOne({ email });
    
    if(!storedOTPVerificationInstance) {
        throw new ApiError(404, "OTP has not been requested or expired");
    }

    if(storedOTPVerificationInstance.expiresAt < Date.now()) {
        throw new ApiError(400, "OTP has been expired")
    }
    
    if(!await storedOTPVerificationInstance.isOTPValid(OTP)) {
        throw new ApiError(400, "Invalid OTP");
    }
    
    await storedOTPVerificationInstance.deleteOne();
    
    // Now create User

    const user = await User.create({
        name,
        email,
        password,
        gender,
        role
    });

    if(!user) {
        throw new ApiError(500, "Error while creating user");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
        new ApiResponse(
            200,
            {
                user,
                accessToken,
                refreshToken
            },
            "User Registered successfully"
        )
    )
});

const resendOTP = asyncHandler( async (req, res) => {
    const { email } = req.body;

    if(!email) {
        throw new ApiError(400, "Email is required");
    }

    const existingRequest = await OTPVerification.findOne({ usersEmail: email });

    if(existingRequest) existingRequest.deleteOne();

    const OTP = await generateOTP(email);

    sendOTPEmail(OTP, email);

    return res
    .status(200)
    .json(
        new ApiResponse(200, {}, "OTP resent successfully")
    )
});

const loginUser = asyncHandler( async (req, res) => {
    const { email, password } = req.body;

    if(
        [email, password].some((field) => field.trim() === "")
    ) {
        throw new ApiError(404, "All fields are required");
    }

    const user = await User.findOne({email});

    if(!user) {
        throw new ApiError(404, "User not found");
    }

    if(!await user.isPasswordCorrect(password)) {
        throw new ApiError(401, "Invalid password");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    const loggedInUser = await User.findById(user._id).select("-password");

    return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
        new ApiResponse(200 , { loggedInUser }, "User logged in successfully")
    )
});

const logoutUser = asyncHandler( async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        }
    )

    return res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(
        new ApiResponse(200, {}, "User logged out successfully")
    )
})

const getCurrentUser = asyncHandler( async(req, res) => {
    return res
    .status(200)
    .json(
        new ApiResponse(200, req.user, "Current user fetched successfully")
    )
});

const changeCurrentPassword = asyncHandler( async (req, res) => {
    const { oldPassword, confirmOldPassword, newPassword } = req.body;
    const userID = req.user._id;

    if(!userID) {
        throw new ApiError("Unauthorized request");
    }

    if(oldPassword !== confirmOldPassword) {
        throw new ApiError(400, "Old Passwod and confirm old password does not match");
    }

    const user = await User.findById(userID);

    if(!user) {
        throw new ApiError(404, "User does not exists");
    }

    if(!await user.isPasswordCorrect(oldPassword)) {
        throw new ApiError(400, "Password is incorrect");
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res
    .status(200)
    .json(
        new ApiResponse(200, {}, "Password Changed successfully")
    )
});

const sendOTPToResetPassword = asyncHandler( async (req, res) => {
    const userID = req.user._id;

    if(!userID) {
        throw new ApiError(401, "Unauthorized request");
    }

    const user = await User.findById(userID);

    if(!user) {
        throw new ApiError(404, "User not found");
    }

    const OTP = await generateOTP(user.email);

    sendResetOTPEmail(OTP, user.email);

    return res
    .status(200)
    .json(
        new ApiResponse(200, {}, "OTP is sent to your registered email")
    )
});

const verifyOTPAndResetPassword = asyncHandler( async (req, res) => {
    const { newPassword, OTP } = req.body;
    const userID = req.user.id;

    if(!newPassword || newPassword.length <= 0) {
        throw new ApiError(404, "New Password is required to reset the password");
    }

    if(!userID) {
        throw new ApiError(400, "Unauthorized request");
    }

    const user = await User.findById(userID);

    if(!user) {
        throw new ApiError(404, "User not found");
    }

    const storedOTPVerificationInstance = await OTPVerification.findOne({ email: user.email });

    if(!storedOTPVerificationInstance) {
        throw new ApiError(404, "The OTP has either already been verified or has expired");
    }

    if(storedOTPVerificationInstance.expiresAt < Date.now()) {
        throw new ApiError(400, "OTP has been expired")
    }
    
    if(!await storedOTPVerificationInstance.isOTPValid(OTP)) {
        throw new ApiError(400, "Invalid OTP");
    }
    
    await storedOTPVerificationInstance.deleteOne();

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res
    .status(200)
    .json(
        new ApiResponse(200, {}, "Your password has been rest successfully")
    )
})

const getAllBookedFacilities = asyncHandler( async (req, res) => {
    const userID = req.user?._id;

    if(!userID) {
        throw new ApiError(404, "Unauthorized request");
    }

    const user = await User.findById(userID);

    if(!user) {
        throw new ApiError(404, "User not found");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, user.bookings, "All booked facilities fetched successfully")
    )
})

export {
    registerUser,
    verifyOTPAndCreateUser,
    resendOTP,
    loginUser,
    logoutUser,
    changeCurrentPassword,
    getCurrentUser,
    sendOTPToResetPassword,
    verifyOTPAndResetPassword,
    getAllBookedFacilities
}