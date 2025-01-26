import { Router } from "express"
import { bookFacility, cancelBooking, getBookingByID } from "../controllers/booking.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js"

const router = Router();

router.route('/book').post(verifyJWT ,bookFacility);
router.route('/cancel').delete(verifyJWT, cancelBooking);
router.route('/booking/:bookingID').get(verifyJWT, getBookingByID);

export default router