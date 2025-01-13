import mongoose, { Schema } from "mongoose"
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const userSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            minlength: [3, "Email must be atleast 3 characters long"]
        },
        password: {
            type: String,
            required: true,
            trim: true
        },
        role: {
            type: String,
            enum: ['faculty', 'student', 'athlete', 'admin'],
            default: 'student',
            required: true
        },
        refreshToken: {
            type: String,
            select: false
        },
        bookings: [
            {
                type: Schema.Types.ObjectId,
                ref: "Facility"
            }
        ],
        noShowCount: {
            type: Number,
            default: 0,
            min: 0,
            max: 3
        },
        isBanned: {
            type: Boolean,
            required: true,
            default: false
        },
        banLiftDate: {
            type: Date,   
        }
    }, { timestamps: true }
);

userSchema.pre('save', async function(next) {
    if(this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10);
    }

    next();
});

userSchema.methods.isPasswordCorrect = async function(password) {
    return await bcrypt.compare(password, this.password);
}

userSchema.methods.generateAccessToken = function() {
    return jwt.sign(
        {
            _id: this._id,
            name: this.name,
            email: this.email
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = function() {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User", userSchema)