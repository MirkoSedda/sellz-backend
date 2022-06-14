import express from "express"
import orderModel from "../orders/model.js"
import { JWTAuthMiddleware } from "../../auth/JWTmiddleware.js"
import { adminOnlyMiddleware } from "../../auth/adminOnlyMiddleware.js"

export const adminsRouter = express.Router()

adminsRouter.get(
  "/orders",
  JWTAuthMiddleware,
  adminOnlyMiddleware,
  async (req, res, next) => {
    try {
      let orders = await orderModel
        .find({})
        .sort({ createdAt: -1 })
        .populate("products.product ")

      if (orders) {
        res.status(200).send(orders)
      } else {
        next(401, `User with id ${req.user._id} not found!`)
      }
    } catch (error) {
      next(error)
    }
  }
)

adminsRouter.put(
  "/order-status",
  JWTAuthMiddleware,
  adminOnlyMiddleware,
  async (req, res, next) => {
    try {
      const { orderId, orderStatus } = req.body

      const order = await orderModel.findById(orderId)

      const updateOrder = await orderModel.findByIdAndUpdate(
        orderId,
        {
          orderStatus,
        },
        { new: true }
      )

      if (updateOrder) {
        res.send(updateOrder)
      } else {
        next(401, `User with id ${req.user._id} not found!`)
      }
    } catch (error) {
      next(error)
    }
  }
)
