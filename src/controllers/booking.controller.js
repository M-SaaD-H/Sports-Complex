import { Booking } from "../models/booking.model.js";
import { Facility } from "../models/facility.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const bookFacility = asyncHandler( async(req, res) => {
    const { facilityID, slot } = req.body;
    const userID = req.user?._id;

    if(
        [facilityID, slot].some((field => field.trim() === ""))
    ) {
        throw new ApiError(404, "All fields are required");
    }

    if(!userID) {
        throw new ApiError(401, "Unauthorized request");
    }

    const user = await User.findById(userID);

    if(!user) {
        throw new ApiError(404, "User not found");
    }
    
    const facility = await Facility.findById(facilityID);

    if(!facility) {
        throw new ApiError(404, "Facility not found");
    }

    if(!facility.availableSlots.includes(slot)) {
        throw new ApiError(400, "This facility can not be booked for this slot");
    }

    if(slot === "16:00 - 17:00" && user.gender !== "female") {
        throw new ApiError(400, "Only Female Students can book this slot");
    }

    if((slot === "06:00 - 07:30" || slot === "18:00 - 19:30") && user.role !== "faculty") {
        throw new ApiError(400, "This slot is reserved for Faculty and Staff");
    }

    const existingBooking = await Booking.find({ facility ,slot });

    if(existingBooking.length >= facility.maxBookings) {
        throw new ApiError(400, "This facility has been already booked for this slot");
    }

    // Extra Check - Booking in past

    const startingTime = slot.split(" ")[0];

    const [hours, mins] = startingTime.split(":");

    const slotStartingTime = new Date().setHours(parseInt(hours), parseInt(mins), 0, 0);

    if(slotStartingTime < Date.now()) {
        throw new ApiError(400, "Booking in past is not allowed");
    }

    // Now book the facility

    const booking = await Booking.create({
        user,
        facility,
        slot
    });

    if(!booking) {
        throw new ApiError(500, "Error occured while booking the facility");
    }

    // Push the booking in the bookings array of the user

    user.bookings.push(booking);
    user.save({ validateBeforeSave: false });

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            booking,
            "Facility booked successfully"
        )
    )
});

const cancelBooking = asyncHandler( async (req, res) => {
    const { bookingID } = req.body;
    const userID = req.user?._id;

    if(!bookingID) {
        throw new ApiError(404, "booking ID is required");
    }

    if(!userID) {
        throw new ApiError(401, "Unauthorized request");
    }

    const user = await User.findById(userID);

    if(!user) {
        throw new ApiError(404, "User not found")
    }

    const booking = await Booking.findById(bookingID);

    if(!booking) {
        throw new ApiError(404, "Booking not found");
    }

    if(!user.bookings.includes(booking._id)) {
        throw new ApiError(400, "You have not booked this facility so you can not cancel it either");
    }

    // Check if the user have met the cacellation deadline or not

    const startingTime = booking.slot.split(" ")[0];

    const [hours, mins] = startingTime.split(":");

    const slotStartingTime = new Date().setHours(parseInt(hours), parseInt(mins), 0, 0);

    const lastCancellationTime = new Date(slotStartingTime);

    lastCancellationTime.setMinutes(lastCancellationTime.getMinutes() - booking.cancellationDeadline);


    if(Date.now() > lastCancellationTime) {
        throw new ApiError(400, "A booking can not be cancelled beyond the deadline");
    }

    // Now cancel the booking

    user.bookings.pull(booking);
    await user.save({ validateBeforeSave: false });

    await booking.deleteOne();

    return res
    .status(200)
    .json(
        new ApiResponse(200, {}, "Booking cancelled successfully")
    )
})

const getBookingByID = asyncHandler( async (req, res) => {
    const { bookingID } = req.params;
    const userID = req.user._id;

    if(!userID) {
        throw new ApiError(401, "Unauthorized request");
    }

    const user = await User.findById(userID);

    if(!user) {
        throw new ApiError(404, "User not found");
    }

    const booking = await Booking.findById(bookingID);

    if(!booking) {
        throw new ApiError(404, "Booking not found");
    }

    // Only Admins and the User who have booked the facility will be able to get the booking
    if(!user.bookings.includes(booking._id) && user.role !== 'admin') {
        throw new ApiError(401, "You have not booked this facility");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, booking, "Booking fetched successfully")
    )
})

export {
    bookFacility,
    cancelBooking,
    getBookingByID
}