import express from "express"
import createError from "http-errors"
import productsModel from "../products/model.js"
import { JWTAuthMiddleware } from "../../auth/JWTmiddleware.js"
export const commentsRouter = express.Router()

commentsRouter.post(
  "/:productId/comments",
  JWTAuthMiddleware,
  async (req, res, next) => {
    try {
      const newComment = {
        ...req.body,
        commentDate: new Date(),
      }
      const product = await productsModel.findByIdAndUpdate(
        req.params.productId,
        { $push: { comments: newComment } },
        { new: true, runValidators: true }
      )
      if (product) {
        res.send(product)
      } else {
        next(
          createError(404, `Product with id ${req.params.productId} not found!`)
        )
      }
    } catch (error) {
      console.log(error)
    }
  }
)

//ok

commentsRouter.get(
  "/:productId/comments",
  JWTAuthMiddleware,
  async (req, res, next) => {
    try {
      const product = await productsModel.findById(req.params.productId)
      if (product) {
        res.send(product.comments)
      } else {
        next(
          createError(404, `Product with id ${req.params.productId} not found!`)
        )
      }
    } catch (error) {
      next(error)
    }
  }
)

//ok

commentsRouter.get(
  "/:productId/comments/:commentId",
  JWTAuthMiddleware,
  async (req, res, next) => {
    try {
      const product = await productsModel.findById(req.params.productId)
      if (product) {
        const comment = product.comments.find(
          comment => comment._id.toString() === req.params.commentId
        )
        if (comment) {
          res.send(comment)
        } else {
          next(
            createError(
              404,
              `Comment with id ${req.params.commentId} is not found!`
            )
          )
        }
      } else {
        next(
          createError(
            404,
            `Product with id ${req.params.productId} is not found!`
          )
        )
      }
    } catch (error) {
      next(error)
    }
  }
)

//ok

commentsRouter.put(
  "/:productId/comments/:commentId",
  JWTAuthMiddleware,
  async (req, res, next) => {
    try {
      const product = await productsModel.findById(req.params.productId)
      if (product) {
        const index = product.comments.findIndex(
          comment => comment._id.toString() === req.params.commentId
        )

        if (index !== -1) {
          product.comments[index] = {
            ...product.comments[index].toObject(),
            ...req.body,
          }

          await product.save()

          res.send(product)
        } else {
          next(
            createError(
              404,
              `Product with id ${req.params.productId} is not found!`
            )
          )
        }
      } else {
        next(
          createError(
            404,
            `Comment with id ${req.params.commentId} is not found!`
          )
        )
      }
    } catch (error) {
      next(error)
    }
  }
)

//ok

commentsRouter.delete(
  "/:productId/comments/:commentId",
  JWTAuthMiddleware,
  async (req, res, next) => {
    try {
      const productToUpdate = await productsModel.findByIdAndUpdate(
        req.params.productId,
        { $pull: { comments: { _id: req.params.commentId } } },
        { new: true }
      )

      if (productToUpdate) {
        res.send(productToUpdate)
      } else {
        next(
          createError(404, `Blog with id ${req.params.productId} is not found!`)
        )
      }
    } catch (error) {
      next(error)
    }
  }
)

