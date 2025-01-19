import { Router } from "express"
import { getAllBookedFacilities, loginUser, logoutUser, registerUser, verifyOTPAndCreateUser } from "../controllers/user.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route('/register').post(registerUser);
router.route('/verify-otp').post(verifyOTPAndCreateUser);

router.route('/login').post(loginUser);
router.route('/logout').post(verifyJWT, logoutUser);

router.route('/bookings').get(verifyJWT, getAllBookedFacilities);

export default router