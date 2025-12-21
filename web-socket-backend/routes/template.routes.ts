import { Router } from "express";
import { getTemplateJson } from "../controller/template/template.controller.ts";


const router = Router();


router.get("/:id", getTemplateJson)

export default router;