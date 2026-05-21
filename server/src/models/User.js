import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: 50,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false, // Never return password by default
    },
    avatar: {
      type: String,
      default: "",
    },
    settings: {
      timezone: { type: String, default: "Asia/Kolkata" },
      workingHoursStart: { type: Number, default: 9 },
      workingHoursEnd: { type: Number, default: 18 },
      notificationsEnabled: { type: Boolean, default: true },
    },
    refreshToken: {
      type: String,
      select: false,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

// Hash password before saving
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
