import { Router } from "express"
import { changeCurrentPassword, getAllBookedFacilities, getCurrentUser, loginUser, logoutUser, registerUser, resendOTP, sendOTPToResetPassword, verifyOTPAndCreateUser, verifyOTPAndResetPassword } from "../controllers/user.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route('/register').post(registerUser);
router.route('/verify-otp').post(verifyOTPAndCreateUser);
router.route('/resend-otp').post(resendOTP);

router.route('/login').post(loginUser);
router.route('/logout').post(verifyJWT, logoutUser);

router.route('/change-password').patch(verifyJWT, changeCurrentPassword);
router.route('/send-otp-to-reset-password').post(verifyJWT, sendOTPToResetPassword);
router.route('/verify-otp-and-reset-password').post(verifyJWT, verifyOTPAndResetPassword);

router.route('/get-current-user').get(verifyJWT, getCurrentUser);

router.route('/bookings').get(verifyJWT, getAllBookedFacilities);

export default router