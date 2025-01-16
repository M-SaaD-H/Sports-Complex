import mongoose, { Schema } from "mongoose"

const facilitySchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        // quantity: {
        //     type: Number,
        //     required: true
        // },
        availableSlots: [
            {
                type: String,
                required: true,
                trim: true
            }
        ],
        isAvailable: {
            type: Boolean,
            default: true
        }
    }
)

export const Facility = mongoose.model("Facility", facilitySchema);