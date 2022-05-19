import express from "express"
import createError from "http-errors"
import categoryModel from "./model.js"
import q2m from "query-to-mongo"
import { JWTAuthMiddleware } from "../../auth/JWTmiddleware.js"
import { adminOnlyMiddleware } from "../../auth/adminOnlyMiddleware.js"

const categoryRouter = express.Router()

categoryRouter.get(
  "/",
  JWTAuthMiddleware,
  adminOnlyMiddleware,
  async (req, res, next) => {
    try {
      const categories = await categoryModel.find()
      res.send(categories)
    } catch (error) {
      next(error)
    }
  }
)

categoryRouter.post(
  "/",
  JWTAuthMiddleware,
  adminOnlyMiddleware,
  async (req, res, next) => {
    try {
      const newCategory = new categoryModel(req.body)
      const { _id } = await newCategory.save()
      res.status(201).send({ _id })
    } catch (error) {
      next(error)
      console.log(error)
    }
  }
)

categoryRouter.get("/:slug", async (req, res, next) => {
  try {
    const category = await categoryModel.find(req.params.slug)
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

categoryRouter.put(
  "/:slug",
  JWTAuthMiddleware,
  adminOnlyMiddleware,
  async (req, res, next) => {
    try {
      const updatedCategory = await categoryModel.findOneAndUpdate(
        req.params.slug,
        req.body,
        { new: true, runValidators: true }
      )
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

categoryRouter.delete(
  "/:slug",
  JWTAuthMiddleware,
  adminOnlyMiddleware,
  async (req, res, next) => {
    try {
      const deletedCategory = await categoryModel.findOneAndUpdate(
        req.params.slug
      )
      if (deletedCategory) res.status(204).send()
      else
        next(
          createError(404, `Category with slug ${req.params.slug} not found!`)
        )
    } catch (error) {
      next(error)
      console.log(error)
    }
  }
)

export default categoryRouter
