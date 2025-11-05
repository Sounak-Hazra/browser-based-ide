import mongoose, { Schema, model, models } from "mongoose";

const UserSchema = new Schema(
    {
        name: String,
        email: { type: String, required: true, unique: true },
        emailVerified: Date,
        image: String,
        role: { type: String, enum: ["user", "admin"], default: "user" },
        createdAt: { type: Date, default: Date.now },
    },
    { collection: "users", strict: false }
);

UserSchema.pre("save", function (next) {
    if (this.isNew) {
        return next(new Error("User creation is disabled for this model."));
    }
    next();
});

UserSchema.pre("insertMany", function (next) {
    return next(new Error("Bulk user creation is disabled for this model."));
});

const User = models.User || model("User", UserSchema);
export default User;
