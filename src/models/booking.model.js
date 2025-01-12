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
        endingTimeOfSlot: {
            type: String
        },
        calcellationDeadline: { // in min
            type: Number,
            type: 120
        }
    }
)

export const Booking = mongoose.model("Booking", bookingSchema)