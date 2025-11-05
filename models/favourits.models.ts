import mongoose from "mongoose";


const favouritsSchema = new mongoose.Schema({
    isMarked: {
        type: Boolean,
        required: true
    },
    userId: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true
    },
    playgroundId: {
        type: mongoose.Types.ObjectId,
        ref: "Playground",
        required: true,
        unique: true
    },
}, { timestamps: true })




const Favourit = mongoose.models.Favourit || mongoose.model("Favourit", favouritsSchema)


export default Favourit