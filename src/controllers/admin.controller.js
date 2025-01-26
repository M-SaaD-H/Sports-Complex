import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js"
import { Facility } from "../models/facility.model.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Booking } from "../models/booking.model.js";

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

const getAllBookings = asyncHandler( async (req, res) => {
    const userID = req.user._id;

    if(!userID) {
        throw new ApiError(401, "Unauthorized request");
    }

    const user = await User.findById(userID);

    if(!user) {
        throw new ApiError(404, "User not found");
    }

    if(user.role !== 'admin') {
        throw new ApiError(401, "Only Admins can access this resource");
    }

    const bookings = await Booking.find();

    if(!bookings || bookings.length === 0) {
        throw new ApiError(404, "No Bookings Found");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, bookings, "All Bookings fetched successfully")
    )
});

const changeRole = asyncHandler( async(req, res) => {
    const { newRole, subjectUserID } = req.body;
    const userID = req.user._id;

    if(!subjectUserID || !newRole || subjectUserID.length() === 0 || newRole.length() === 0) {
        throw new ApiError(404, "All field are required");
    }

    if(!userID) {
        throw new ApiError(401, "Unauthorized request");
    }

    const user = await User.findById(userID);

    if(!user) {
        throw new ApiError(404, "User not found");
    }

    if(user.role !== 'admin') {
        throw new ApiError(401, "Only Admins can change roles of Users");
    }

    const subjectUser = await User.findByIdAndUpdate(
        subjectUserID,
        {
            role: newRole
        },
        {
            new: true
        }
    )

    if(!subjectUser) {
        throw new ApiError(404, "Subject User not found");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, {}, "Subject User's role changes")
    )
});

const cancelAnyBooking = asyncHandler( async(req, res) => {
    const { bookingID } = req.body;
    const userID = req.user._id;

    if(!userID || userID.length() === 0) {
        throw new ApiError(401, "Unauthorized request");
    }

    if(!bookingID || bookingID.length() === 0) {
        throw new ApiError(401, "Booking ID is required");
    }

    const user = await User.findById(userID);

    if(!user) {
        throw new ApiError(404, "User not found");
    }

    if(!user.role !== 'admin') {
        throw new ApiError(401, "Only admins can cancel bookings made by other users");
    }

    const booking = await Booking.findById(bookingID);

    if(!booking) {
        throw new ApiError(404, "Booking not found");
    }

    const subjectUser = await User.findById(booking.user);

    if(!subjectUser) {
        throw new ApiError(404, "Subject user not found");
    }

    // Check for the cancellation period - if required

    subjectUser.bookings.pull(booking);
    await subjectUser.save({ validateBeforeSave: false });

    booking.deleteOne();

    return res
    .status(200)
    .json(
        new ApiResponse(200, {}, "User's booking cancelled by Admin")
    )
})

export {
    addFacility,
    removeFacility,
    getAllBookings,
    changeRole,
    cancelAnyBooking
}