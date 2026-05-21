import mongoose from "mongoose";

const aiLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  requestType: {
    type: String,
    enum: ["prioritize", "recommend"],
    required: true,
  },
  promptTokens: {
    type: Number,
    default: 0,
  },
  completionTokens: {
    type: Number,
    default: 0,
  },
  totalCost: {
    type: Number, // estimated cost in USD
    default: 0,
  },
  inputSummary: {
    type: String, // truncated prompt for debugging
    maxlength: 500,
  },
  outputSummary: {
    type: String, // truncated response
    maxlength: 1000,
  },
  latencyMs: {
    type: Number,
    default: 0,
  },
  success: {
    type: Boolean,
    default: true,
  },
  fallbackUsed: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

aiLogSchema.index({ userId: 1, createdAt: -1 });

const AiLog = mongoose.model("AiLog", aiLogSchema);

export default AiLog;
