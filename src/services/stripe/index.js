import express from "express"
import { JWTAuthMiddleware } from "../../auth/JWTAuthMiddleware.js"
import CartModel from "../cart/model.js"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET)

export const stripeRouter = express.Router()

stripeRouter.post(
  "/create-payment-intent",
  JWTAuthMiddleware,
  async (req, res, next) => {
    try {
      console.log(req.body)
      const { couponApplied } = req.body
      console.log(
        "🚀 ~ file: index.js ~ line 17 ~ couponApplied",
        couponApplied
      )

      const { _id } = req.user

      // 2 get cart totals

      const { cartTotal, totalAfterDiscount } = await CartModel.findOne({
        orderedBy: _id,
      })
      console.log(
        "🚀 ~ file: index.js ~ line 26 ~ totalAfterDiscount",
        totalAfterDiscount
      )
      console.log("🚀 ~ file: index.js ~ line 26 ~ cartTotal", cartTotal)

      let finalAmount = 0

      if (couponApplied && totalAfterDiscount) {
        finalAmount = (totalAfterDiscount * 100).toFixed(0)
      } else {
        finalAmount = (cartTotal * 100).toFixed(0)
      }

      // create payment intent with order amount and currency
      const paymentIntent = await stripe.paymentIntents.create({
        amount: finalAmount,
        currency: "eur",
      })
      console.log(
        "🚀 ~ file: index.js ~ line 41 ~ paymentIntent",
        paymentIntent
      )

      res.send({
        clientSecret: paymentIntent.client_secret,
        cartTotal,
        totalAfterDiscount,
        payable: finalAmount,
      })
    } catch (error) {
      next(error)
      console.log(error)
    }
  }
)
