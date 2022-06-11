import express from "express"
import createError from "http-errors"
import couponsModel from "./model.js"
import { JWTAuthMiddleware } from "../../auth/JWTmiddleware.js"
import { adminOnlyMiddleware } from "../../auth/adminOnlyMiddleware.js"

export const couponsRouter = express.Router()

couponsRouter.post(
  "/",
  JWTAuthMiddleware,
  adminOnlyMiddleware,
  async (req, res, next) => {
    try {
      const { name, expiry, discount } = req.body.coupon
      console.log(
        "🚀 ~ file: index.js ~ line 16 ~ req.body.coupon",
        req.body.coupon
      )
      const coupon = new couponsModel({
        name,
        expiry,
        discount,
      })
      await coupon.save()
      res.status(201).send(coupon)
    } catch (error) {
      next(error)
      console.log(error)
    }
  }
)

couponsRouter.get("/", async (req, res, next) => {
  try {
    const coupon = await couponsModel.find({}).sort({ createdAt: -1 })
    if (coupon) res.status(200).send(coupon)
  } catch (error) {
    next(error)
    console.log(error)
  }
})

couponsRouter.delete(
  "/:couponId",
  JWTAuthMiddleware,
  adminOnlyMiddleware,
  async (req, res, next) => {
    try {
      const coupon = await couponsModel.findByIdAndDelete(req.params.couponId)
      if (coupon) res.status(204).send()
      else
        next(
          createError(404, `Sub category with slug ${req.body.slug} not found!`)
        )
    } catch (error) {
      next(error)
      console.log(error)
    }
  }
)
