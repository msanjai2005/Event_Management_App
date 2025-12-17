import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    date: { type: Date, required: true },
    location: { type: String, required: true },

    capacity: {
      type: Number,
      required: true,
      min: 1,
    },

    attendeesCount: {
      type: Number,
      default: 0,
    },

    image: String,

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

eventSchema.index({ date: 1 });

const Event = mongoose.model("Event", eventSchema);
export default Event;
