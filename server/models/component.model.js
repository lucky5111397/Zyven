import mongoose from "mongoose";

const componentSchema = new mongoose.Schema(
  {
    name: String,

    code: String,

    props: [String], // customizable props

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    visibility: {
      type: String,
      enum: ["private", "public"],
      default: "private",
    },

    npmPackage: String,
  },
  { timestamps: true }
);

export default mongoose.model("Component", componentSchema);