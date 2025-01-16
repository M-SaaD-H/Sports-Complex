import { Router } from "express"
import { bookFacility, cancelBooking } from "../controllers/booking.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js"

const router = Router();

router.route('/book').post(verifyJWT ,bookFacility);
router.route('/cancel').delete(verifyJWT, cancelBooking);

export default router