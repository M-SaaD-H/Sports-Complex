import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js"
import { Facility } from "../models/facility.model.js";
import { ApiResponse } from "../utils/apiResponse.js";

const addFacility = asyncHandler( async (req, res) => {
    const { name, maxBookings, availableSlots, isAvailable } = req.body;
    const userID = req.user._id;

    if(!name || name === "" || availableSlots.length === 0) {
        throw new ApiError(404, "All fields are required")
    }

    if(!userID) {
        throw new ApiError(401, "Unauthorized request");
    }

    const user = await User.findById(userID);

    if(!user) {
        throw new ApiError(404, "User not found");
    }

    if(user.role !== "admin") {
        throw new ApiError(401, "Only admins can add facilities");
    }

    const existingFacility = await Facility.findOne({ name: name.trim() });

    if(existingFacility) {
        throw new ApiError(400, "Facility already exists");
    }

    // Now create the facility

    const facility = await Facility.create({
        name,
        maxBookings,
        availableSlots,
        isAvailable
    });

    if(!facility) {
        throw new ApiError(500, "Error while creating the facility");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, {}, "Facility added successfully")
    )
});

const removeFacility = asyncHandler( async (req, res) => {
    const { facilityID } = req.body;
    const userID = req.user._id;

    if(!facilityID) {
        throw new ApiError(404, "Facility ID is required");
    }

    if(!userID) {
        throw new ApiError(401, "Unauthorized request");
    }

    const user = await User.findById(userID);

    if(!user) {
        throw new ApiError(404, "User not found");
    }

    if(user.role !== "admin") {
        throw new ApiError(401, "Only Admins can remove facilities");
    }

    const facility = await Facility.findById(facilityID);

    if(!facility) {
        throw new ApiError(404, "Facility not found");
    }

    // Now delete the facility

    await facility.deleteOne();

    return res
    .status(200)
    .json(
        new ApiResponse(200, {}, "Facility removed successfully")
    )
});

export {
    addFacility,
    removeFacility
}