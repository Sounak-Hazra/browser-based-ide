import { Router } from "express";
import { initContainer } from "../lib/initContainer.ts";


const router = Router();


router.post("/init/:id", initContainer)

export default router;