import express from "express"
import createError from "http-errors"
import productModel from "./model.js"
import q2m from "query-to-mongo"
import usersSchema from "../users/model.js"

const productsRouter = express.Router()

productsRouter.get("/", async (req, res, next) => {
  try {
    const mongoQuery = q2m(req.query)
    const total = await productsModel.countDocuments(mongoQuery.criteria)
    const products = await productsModel
      .find(mongoQuery.criteria, mongoQuery.options.fields)
      .sort(mongoQuery.options.sort) //Mongo will ALWAYS do SORT, SKIP, LIMIT no matter what!
      .skip(mongoQuery.options.skip, 0)
      .limit(mongoQuery.options.limit, 20)
      .populate({ path: "user" })
    res.send({
      links: mongoQuery.links(`http://localhost:3001/products`, total),
      total,
      totalPages: Math.ceil(total / mongoQuery.options.limit),
      products,
    })
  } catch (error) {
    next(error)
  }
})

productsRouter.post("/", async (req, res, next) => {
  try {
    const newProduct = new productsModel(req.body)
    const { _id } = await newProduct.save()
    res.status(201).send({ _id })
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

productsRouter.put("/:productId", async (req, res, next) => {
  try {
    const updatedProduct = await productsModel.findByIdAndUpdate(
      req.params.productId, // WHO
      req.body, // HOW
      { new: true, runValidators: true }
    )
    if (updatedProduct) res.send(updatedProduct)
    else
      next(createError(404, `blog with id ${req.params.productId} not found!`))
  } catch (error) {
    next(error)
  }
})

productsRouter.delete("/:productId", async (req, res, next) => {
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
})

export default productsRouter
