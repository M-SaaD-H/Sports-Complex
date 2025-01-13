import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/apiError.js"
import { ApiResponse } from "../utils/apiResponse.js"
import { User } from "../models/user.model.js"
import { OTPVerification } from "../models/otpVerification.model.js";

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
        throw new ApiError(500, "Erorr while generating access and refresh tokens");
    }
}

// const generateOTP = async (email) => {
//     const OTP = Math.floor(100000 + Math.random() * 900000);

//     await OTPVerification.create({
//         email,
//         OTP,
//         expiresAt: Date.now() + 5 * 60 * 1000 // OTP expires in 5 minutes
//     });

//     return OTP;
// }

const registerUser = asyncHandler( async (req, res) => {
    const { name, email, password, role } = req.body;

    if(
        [name, email, password, role].some((field) => field.trim() === "")
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

    // Now create the User

    const user = await User.create({
        name,
        email,
        password,
        role
    })

    if(!user) {
        throw new ApiError(500, "Error occured while registering the User")
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
            "User registered successfully"
        )
    )
});

// const verifyOTPAndCreateUser = asyncHandler( async (req, res) => {
//     const { name, email, password, role, OTP } = req.body;
    
//     if(
//         [name, email, password, role].some((field) => field.trim() === "")
//     ) {
//         throw new ApiError(404, "All fields are required");
//     }
    
//     if(!email.includes('@')) {
//         throw new ApiError(400, "Email is invalid");
//     }
    
//     // const storedOTPVerificationInstance = await OTPVerification.findOne({email})
    
//     // if(!storedOTPVerificationInstance) {
//     //     throw new ApiError(404, "OTP has not been requested or already expired");
//     // }
    
//     // if(!await storedOTPVerificationInstance.isOTPValid(OTP)) {
//     //     throw new ApiError(400, "Invalid OTP");
//     // }
    
//     // storedOTPVerificationInstance.deleteOne();
    
    
// });

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

export {
    registerUser,
    // verifyOTPAndCreateUser,
    loginUser,
    logoutUser
}