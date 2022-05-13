import mongoose from "mongoose"

const { Schema, model } = mongoose

const ProductSchema = new Schema(
  {
    category: { type: String, required: true },
    name: { type: String, required: true },
    image: { type: String, required: true },
    description: { type: String, required: true },
    comments: [
      {
        user: { type: String },
        comment: { type: String },
      },
    ],
  },
  {
    timestamps: true,
  }
)

export default model("Product", ProductSchema)
