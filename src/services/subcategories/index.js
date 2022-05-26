import express from "express"
import slugify from "slugify"
import createError from "http-errors"
import SubCategoriesModel from "./model.js"
import { JWTAuthMiddleware } from "../../auth/JWTmiddleware.js"
import { adminOnlyMiddleware } from "../../auth/adminOnlyMiddleware.js"

const subCategoriesRouter = express.Router()

subCategoriesRouter.post(
  "/",
  JWTAuthMiddleware,
  adminOnlyMiddleware,
  async (req, res, next) => {
    try {
      const { name, parent } = req.body
      const newSubCategory = new SubCategoriesModel({
        name,
        parent,
        slug: slugify(name),
      })
      await newSubCategory.save()
      res.status(201).send(newSubCategory)
    } catch (error) {
      next(error)
      console.log(error)
    }
  }
)

subCategoriesRouter.get("/", async (req, res, next) => {
  try {
    const SubCategories = await SubCategoriesModel.find().sort({
      createdAt: -1,
    })
    res.status(200).send(SubCategories)
  } catch (error) {
    next(error)
  }
})

subCategoriesRouter.get("/:slug", async (req, res, next) => {
  try {
    const subCategory = await SubCategoriesModel.findOne({
      slug: req.params.slug,
    })
    if (subCategory) res.send(subCategory)
    else
      next(
        createError(404),
        `Sub category with slug ${req.params.slug} is not found.`
      )
  } catch (error) {
    next(error)
    console.log(error)
  }
})

subCategoriesRouter.put(
  "/:slug",
  JWTAuthMiddleware,
  adminOnlyMiddleware,
  async (req, res, next) => {
    const { name, parent } = req.body
    try {
      const updatedSubCategory = await SubCategoriesModel.findOneAndUpdate(
        { slug: req.params.slug },
        { name, parent, slug: slugify(name) },
        { new: true }
      )
      if (updatedSubCategory) res.send(updatedSubCategory)
      else
        next(
          createError(
            404,
            `Sub category with slug ${req.params.slug} not found!`
          )
        )
    } catch (error) {
      next(error)
    }
  }
)

subCategoriesRouter.delete(
  "/:slug",
  JWTAuthMiddleware,
  adminOnlyMiddleware,
  async (req, res, next) => {
    try {
      const deletedSubCategory = await SubCategoriesModel.findOneAndDelete({
        slug: req.params.slug,
      })
      if (deletedSubCategory) res.status(204).send()
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

export default subCategoriesRouter
