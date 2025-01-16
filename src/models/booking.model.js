import mongoose, { Schema } from "mongoose"

const bookingSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        facility: {
            type: Schema.Types.ObjectId,
            ref: "Facility"
        },
        slot: {
            type: String,
            required: true
        },
        cancellationDeadline: { // in min
            type: Number,
            default: 120
        }
    }, { timestamps: true }
)

export const Booking = mongoose.model("Booking", bookingSchema)