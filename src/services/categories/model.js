import mongoose from "mongoose"

const { Schema, model } = mongoose

const CategorySchema = new Schema(
  {
    name: {
      type: String,
      required: "Name is required",
      trim: true,
      minlength: [3, "Too Short"],
      maxlength: [30, "Too Long"],
    },
    slug: {
      type: String,
      required: "Slug is required",
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
)

export default model("Category", CategorySchema)
