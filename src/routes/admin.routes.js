import { addFacility, cancelAnyBooking, changeRole, getAllBookings, removeFacility } from "../controllers/admin.controller.js";
import { Router } from "express";
import { checkAdmin } from "../middlewares/checkAdmin.middleware.js";

const router = Router();

router.use(checkAdmin);

router.route('/add-facility').post(addFacility);
router.route('/remove-facility').delete(removeFacility);
router.route('/get-all-bookings').get(getAllBookings);
router.route('/change-role').patch(changeRole);
router.route('/cancel-user-booking').delete(cancelAnyBooking);

export default router;