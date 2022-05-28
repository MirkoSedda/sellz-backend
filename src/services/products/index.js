import express from "express"
import createError from "http-errors"
import productsModel from "./model.js"
import slugify from "slugify"
import q2m from "query-to-mongo"
import { JWTAuthMiddleware } from "../../auth/JWTmiddleware.js"
import { adminOnlyMiddleware } from "../../auth/adminOnlyMiddleware.js"

export const productsRouter = express.Router()

productsRouter.post(
  "/",
  JWTAuthMiddleware,
  adminOnlyMiddleware,
  async (req, res, next) => {
    try {
      console.log(req.body)
      req.body.slug = slugify(req.body.title)
      const newProduct = new productsModel(req.body)
      await newProduct.save()
      res.status(201).send(newProduct)
    } catch (error) {
      next(error)
      res.status(400).json(error.message)
      console.log(error.message)
    }
  }
)

productsRouter.get("/", async (req, res, next) => {
  try {
    const products = await productsModel.find({})
    if (products) res.send(products)
    else next(createError(404), `Products not found.`)
  } catch (error) {
    next(error)
    console.log(error)
  }
})

productsRouter.get("/:productId", async (req, res, next) => {
  try {
    const product = await productsModel.findById(req.params.productId)
    if (product) res.send(product)
    else
      next(
        createError(404),
        `Product with the ID ${req.params.productId} is not found.`
      )
  } catch (error) {
    next(error)
    console.log(error)
  }
})

productsRouter.put(
  "/:productId",
  JWTAuthMiddleware,
  adminOnlyMiddleware,
  async (req, res, next) => {
    try {
      const updatedProduct = await productsModel.findByIdAndUpdate(
        req.params.productId, // WHO
        req.body, // HOW
        { new: true, runValidators: true }
      )
      if (updatedProduct) res.send(updatedProduct)
      else
        next(
          createError(404, `blog with id ${req.params.productId} not found!`)
        )
    } catch (error) {
      next(error)
    }
  }
)

productsRouter.delete(
  "/:productId",
  JWTAuthMiddleware,
  adminOnlyMiddleware,
  async (req, res, next) => {
    try {
      const deletedProducts = await productsModel.findByIdAndDelete(
        req.params.productId
      )
      if (deletedProducts) res.status(204).send()
      else
        next(
          createError(404, `Product with id ${req.params.productId} not found!`)
        )
    } catch (error) {
      next(error)
      console.log(error)
    }
  }
)
