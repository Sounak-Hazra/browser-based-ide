import { TEMPLATES } from "@/lib/constants";
import mongoose from "mongoose";
import "./user.models"
import { templatePaths } from "@/lib/template";


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