import mongoose from "mongoose"

const { Schema, model } = mongoose

const CouponSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      unique: true,
      uppercase: true,
      required: "Name is required",
      minlength: [3, "Name must be at least 3 characters long"],
    },
    expiry: {
      type: Date,
      required: "Expiry date is required",
    },
    discount: {
      type: Number,
      required: "Discount is required",
    },
  },
  {
    timestamps: true,
  }
)

export default model("Coupon", CouponSchema)
