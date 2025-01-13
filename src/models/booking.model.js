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
        startingTimeOfSlot: {
            type: Date,
            required: true
        },
        endingTimeOfSlot: {
            type: Date,
            required: true
        },
        calcellationDeadline: { // in min
            type: Number,
            type: 120
        }
    }, { timestamps: true }
)

export const Booking = mongoose.model("Booking", bookingSchema)