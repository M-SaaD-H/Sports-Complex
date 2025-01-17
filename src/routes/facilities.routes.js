import { Router } from "express";
import { getAllAvailableFacilities } from "../controllers/facilities.controller.js";

const router = Router();

router.route('/get-all-available-facilities').get(getAllAvailableFacilities);

export default router;