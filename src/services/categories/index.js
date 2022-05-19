import express from "express"
import slugify from "slugify"
import createError from "http-errors"
import categoriesModel from "./model.js"
import { JWTAuthMiddleware } from "../../auth/JWTmiddleware.js"
import { adminOnlyMiddleware } from "../../auth/adminOnlyMiddleware.js"

const categoriesRouter = express.Router()

//ok!
categoriesRouter.post(
  "/",
  JWTAuthMiddleware,
  adminOnlyMiddleware,
  async (req, res, next) => {
    try {
      const { name } = req.body
      const newCategory = new categoriesModel({
        name,
        slug: slugify(name),
      })
      await newCategory.save()
      res.status(201).send(newCategory)
    } catch (error) {
      next(error)
      console.log(error)
    }
  }
)

//ok
categoriesRouter.get(
  "/",
  JWTAuthMiddleware,
  adminOnlyMiddleware,
  async (req, res, next) => {
    try {
      const categories = await categoriesModel.find()
      res.status(200).send(categories)
    } catch (error) {
      next(error)
    }
  }
)

//ok!
categoriesRouter.get("/:slug", async (req, res, next) => {
  try {
    const category = await categoriesModel.findOne({ slug: req.params.slug })
    if (category) res.send(category)
    else
      next(
        createError(404),
        `Category with slug ${req.params.slug} is not found.`
      )
  } catch (error) {
    next(error)
    console.log(error)
  }
})

categoriesRouter.put(
  "/:slug",
  JWTAuthMiddleware,
  adminOnlyMiddleware,
  async (req, res, next) => {
    try {
      const updatedCategory = await categoriesModel.findOneAndUpdate(
        {
          slug: req.params.slug,
        },
        req.body,
        { new: true, runValidators: true }
      )
      console.log(req.params)
      console.log(req.params.slug)
      if (updatedCategory) res.send(updatedCategory)
      else
        next(
          createError(404, `Category with slug ${req.params.slug} not found!`)
        )
    } catch (error) {
      next(error)
    }
  }
)

categoriesRouter.delete(
  "/:slug",
  JWTAuthMiddleware,
  adminOnlyMiddleware,
  async (req, res, next) => {
    try {
      const deletedCategory = await categoriesModel.findOneAndDelete({
        slug: req.params.slug,
      })
      if (deletedCategory) res.status(204).send()
      else
        next(createError(404, `Category with slug ${req.body.slug} not found!`))
    } catch (error) {
      next(error)
      console.log(error)
    }
  }
)

export default categoriesRouter
