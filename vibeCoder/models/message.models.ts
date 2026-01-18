import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Conversation",
        required: true,
    },
    role: {
        type: String,
        enum: ["user", "assistant", "system"],
        required: true,
    },
    content: {
        type: String,
        default: "",
    },
    mode: {
        type: String,
        default: "assistant",
    },
    model: {
        type: String,
    },
}, { timestamps: true });

const Message = mongoose.models.Message || mongoose.model("Message", messageSchema);

export default Message;