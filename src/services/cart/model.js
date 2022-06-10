import mongoose from "mongoose"

const { Schema, model } = mongoose

const CartSchema = new Schema(
  {
    products: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: "Product",
        },
        count: Number,
        color: String,
        price: Number,
      },
    ],
    cartTotal: Number,
    totalAfterDiscount: Number,
    orderdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
)

export default model("Cart", CartSchema)
