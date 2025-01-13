import mongoose, { Schema } from "mongoose"

const facilitySchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        quantity: {
            type: Number,
            required: true
        },
        type: {
            type: String,
            enum: ['indoor', 'outdoor'],
            required: true
        },
        unavailableSlots: [
            {
                type: String,
                trim: true
            }
        ]
    }
)

const slotDurationForIndoorInMin = 30;

const slotDurationForOutdoorInMin = 60;

const slotDurationForPracticeInMin = 180;

const Facility = mongoose.model("Facility", facilitySchema);

export {
    slotDurationForIndoorInMin,
    slotDurationForOutdoorInMin,
    slotDurationForPracticeInMin,
    Facility
}