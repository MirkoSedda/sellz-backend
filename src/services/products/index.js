import express from "express"
import createError from "http-errors"
import productsModel from "./model.js"
import slugify from "slugify"
import q2m from "query-to-mongo"
import { JWTAuthMiddleware } from "../../auth/JWTmiddleware.js"
import { adminOnlyMiddleware } from "../../auth/adminOnlyMiddleware.js"

export const productsRouter = express.Router()

productsRouter.get("/limit/:limit", async (req, res, next) => {
  try {
    const products = await productsModel
      .find({})
      .limit(parseInt(req.params.limit))
      .populate("Category")
      .populate("subCategories")
      .sort([["createdAt", -1]])
    if (products) res.send(products)
    else next(createError(404), `Products not found.`)
  } catch (error) {
    next(error)
    console.log(error)
  }
})

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

productsRouter.get("/:slug", async (req, res, next) => {
  try {
    const product = await productsModel
      .findOne({ slug: req.params.slug })
      .populate("Category")
      // .populate("subCategories")
      .sort([["createdAt", -1]])
    console.log(product)
    if (product) res.send(product)
    else
      next(
        createError(404),
        `Product with the slug ${req.params.slug} is not found.`
      )
  } catch (error) {
    next(error)
    console.log(error)
  }
})

productsRouter.put(
  "/:slug",
  JWTAuthMiddleware,
  adminOnlyMiddleware,
  async (req, res, next) => {
    try {
      const updatedProduct = await productsModel.findOneAndUpdate(
        req.params.slug, // WHO
        req.body, // HOW
        { new: true, runValidators: true }
      )
      if (updatedProduct) res.send(updatedProduct)
      else
        next(
          createError(404, `Product with slug ${req.params.slug} not found!`)
        )
    } catch (error) {
      next(error)
    }
  }
)

productsRouter.delete(
  "/:slug",
  JWTAuthMiddleware,
  adminOnlyMiddleware,
  async (req, res, next) => {
    try {
      const deleteProduct = await productsModel.findOneAndRemove({
        slug: req.params.slug,
      })
      if (deleteProduct) res.status(204).send("Product deleted successfully!")
      else
        next(
          createError(404, `Product with slug ${req.params.slug} wasnt found!`)
        )
    } catch (error) {
      next(error)
      console.log(error)
    }
  }
)
