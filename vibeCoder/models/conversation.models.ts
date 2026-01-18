import mongoose from "mongoose";
import "./user.models.ts"


const conversationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        ref: "User",
    },
    title: {
        type: String,
        required: true,
        unique: true 
    },
    model: {
        type: String,
    },
    systemPrompt: {
        type: String
    },
}, { timestamps: true })

const Conversation = mongoose.models.Conversation || mongoose.model("Conversation", conversationSchema);
export default Conversation;