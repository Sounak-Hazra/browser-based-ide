import { TEMPLATES } from "../lib/constants.ts";
import mongoose from "mongoose";
import "./user.models.ts"
// import { perpous, templatePaths } from "@/lib/template";
import { templatePaths, perpous } from "../lib/template.ts";


const playgroundSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    template: {
        type: String,
        enum: Object.keys(templatePaths),
        required: true
    },
    perpous:{
        type: String,
        enum: Object.keys(perpous),
    },
    favourit: {
        type: mongoose.Types.ObjectId,
        ref: "Favourit"
    },
    userId: {
        type: mongoose.Types.ObjectId,
        ref: "User"
    },
    templateFiles: {
        type: [mongoose.Types.ObjectId],
        default: [],
        ref: "TemplatesFile"
    }
}, { timestamps: true })

const Playground = mongoose.models.Playground || mongoose.model("Playground", playgroundSchema);
export default Playground;