import express from "express"
import createError from "http-errors"
import productsModel from "./model.js"
import usersModel from "../users/model.js"
import slugify from "slugify"
import {
  handleQuery,
  handlePrice,
  handleCategory,
  handleRating,
  handleSubCategory,
  handleShipping,
  handleColor,
  handleBrand,
} from "./search&filter.js"
import { JWTAuthMiddleware } from "../../auth/JWTmiddleware.js"
import { adminOnlyMiddleware } from "../../auth/adminOnlyMiddleware.js"

export const productsRouter = express.Router()

productsRouter.get("/total-number-of-products", async (req, res, next) => {
  try {
    await productsModel.estimatedDocumentCount(
      {},
      (err, totalNumberOfProducts) => res.send({ totalNumberOfProducts })
    )
  } catch (error) {
    next(error)
    res.status(400).json(error.message)
    console.log(error.message)
  }
})

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

productsRouter.post("/sort-order-page", async (req, res, next) => {
  try {
    const { sort, order, page } = req.body
    const currentPage = page || 1
    const productsPerPage = 3
    const skipPage = (currentPage - 1) * productsPerPage
    const products = await productsModel
      .find({})
      .skip(skipPage)
      .populate("category")
      .populate("subCategories")
      .sort([[sort, order]])
      .limit(productsPerPage)
    if (products) res.send(products)
  } catch (error) {
    next(error)
    res.status(400).json(error.message)
    console.log(error.message)
  }
})

productsRouter.get("/related/:productId", async (req, res, next) => {
  try {
    const product = await productsModel.findById(req.params.productId)
    const relatedProducts = await productsModel
      .find({
        _id: { $ne: req.params.productId },
        category: product.category,
      })
      .limit(3)
      .populate("category")
      .populate("subCategories")
      .populate("postedBy", "name")
    if (relatedProducts) res.send(relatedProducts)
  } catch (error) {
    next(error)
    res.status(400).json(error.message)
    console.log(error.message)
  }
})

productsRouter.post("/search/filters", async (req, res, next) => {
  try {
    const {
      query,
      price,
      category,
      stars,
      subCategory,
      shipping,
      color,
      brand,
    } = req.body

    if (query) {
      await handleQuery(req, res, next, query)
    }
    if (price !== undefined) {
      await handlePrice(req, res, next, price)
    }
    if (category !== undefined) {
      await handleCategory(req, res, next, category)
    }
    if (stars !== undefined) {
      await handleRating(req, res, next, stars)
    }
    if (subCategory !== undefined) {
      await handleSubCategory(req, res, next, subCategory)
    }
    if (shipping !== undefined) {
      await handleShipping(req, res, next, shipping)
    }
    if (color !== undefined) {
      await handleColor(req, res, next, color)
    }
    if (brand !== undefined) {
      await handleBrand(req, res, next, brand)
    }
  } catch (error) {
    next(error)
    res.status(400).json(error.message)
    console.log(error.message)
  }
})

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
      .populate("category")
      .populate("subCategories")
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
      const updateProduct = await productsModel.findByIdAndUpdate(
        req.body._id, // WHO
        req.body, // HOW
        { new: true, runValidators: true }
      )
      if (updateProduct) res.send(updateProduct)
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

productsRouter.put(
  "/rating/:userId/:productId",
  JWTAuthMiddleware,
  async (req, res, next) => {
    try {
      const { star } = req.body
      const product = await productsModel.findById(req.params.productId)
      const user = await usersModel.findById(req.params.userId)

      console.log(product)
      console.log(user)
      const existingRatingObject = product.ratings.find(
        rating => rating.postedBy.toString() === user._id.toString()
      )

      if (existingRatingObject === undefined) {
        const addRating = await productsModel.findByIdAndUpdate(
          product._id,
          {
            $push: {
              ratings: {
                star,
                postedBy: user._id,
              },
            },
          },
          { new: true }
        )
        if (addRating) res.send(addRating)
      } else {
        const updatedRating = await productsModel.updateOne(
          {
            ratings: {
              $elemMatch: existingRatingObject,
            },
          },
          {
            $set: {
              "ratings.$.star": star,
            },
          },
          { new: true }
        )
        if (updatedRating) res.send(updatedRating)
      }
    } catch (error) {
      next(error)
    }
  }
)
