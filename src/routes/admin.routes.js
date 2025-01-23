import { addFacility, removeFacility } from "../controllers/admin.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { Router } from "express";

const router = Router();

router.route('/add-facility').post(verifyJWT, addFacility);
router.route('/remove-facility').delete(verifyJWT, removeFacility);

export default router;