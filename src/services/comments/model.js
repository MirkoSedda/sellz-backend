import mongoose from "mongoose"

const { Schema, model } = mongoose

const CommentSchema = new Schema({
  comment: { type: String, required: true },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  products: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Products",
  },
})

export default model("Comment", CommentSchema)
