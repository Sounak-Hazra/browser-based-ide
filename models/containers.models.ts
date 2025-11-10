import mongoose from "mongoose";


const ContainerSchema = new mongoose.Schema({
    containerId : { type: String, required: true },
    userId: { type: String, required: true },
    projectId: { type: String, required: true },
    runId: { type: String, required: true },
    createdAt: { type: Date, default: Date.now,},
    exitedAt: { type: Date },
    status: { type: String, required: true, default: "running" },
    expiresAt: { type: Date },
});

ContainerSchema.methods.updateStatus = function(newStatus: string) {
    this.status = newStatus;
    return this.save();
};

ContainerSchema.pre('save', function(next) {
    if (this.isNew && this.isModified("createdAt")) {
        this.expiresAt = new Date(this.createdAt.getTime() + 1000 * 60 * 60);
    }
    next();
});


export default mongoose.model("Container", ContainerSchema);