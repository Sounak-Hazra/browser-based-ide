import mongoose from "mongoose";


const templateFileSchema = new mongoose.Schema({
    content: {
        type: JSON,
        default:{}
    },
    playgroundId: {
        type: mongoose.Types.ObjectId,
        unique: true,
        required: true,
        ref: "Playground"
    }
})

const TemplatesFilesModel = mongoose.models.TemplatesFile || mongoose.model("TemplatesFile", templateFileSchema)

export default TemplatesFilesModel