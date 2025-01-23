import { Facility } from "../models/facility.model.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getAllAvailableFacilities = asyncHandler( async (req, res) => {
    const facilities = await Facility.find({ isAvailable: true });

    return res
    .status(200)
    .json(
        new ApiResponse(200, facilities, "All facilities fetched successfully")
    )
});

export { getAllAvailableFacilities }