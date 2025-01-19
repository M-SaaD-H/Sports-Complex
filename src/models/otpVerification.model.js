import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";

const otpVerificationSchema = new Schema(
    {
        email: {
            type: String,
            required: true
        },
        OTP: {
            type: String, // have to use string instead of number because bcrypt only hashes strings and return hashed output as string
            required: true
        },
        expiresAt: {
            type: Date,
            required: true,
            index: { expireAfterSeconds: 1 }
        }
    }, { timestamps: true }
);

otpVerificationSchema.pre("save", async function(next) {
    if(this.isModified("OTP")) {
        this.OTP = await bcrypt.hash(this.OTP, 10);
    }

    next();
});

otpVerificationSchema.methods.isOTPValid = async function(OTP) {
    return await bcrypt.compare(OTP, this.OTP);
}


export const OTPVerification = mongoose.model("OTPVerification", otpVerificationSchema);