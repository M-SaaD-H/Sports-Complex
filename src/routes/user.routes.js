import { Router } from "express"
import { getAllBookedFacilities, loginUser, logoutUser, registerUser } from "../controllers/user.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.route('/register').post(registerUser);
// verifyOTPAndCreateUser
router.route('/login').post(loginUser);
router.route('/logout').post(verifyJWT, logoutUser);

router.route('/bookings').get(verifyJWT, getAllBookedFacilities);

export default router