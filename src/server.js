import express from "express"
import mongoose from "mongoose"
import listEndpoints from "express-list-endpoints"
import cors from "cors"
import passport from "passport"
import googleStrategy from "./auth/OAuth.js"
import path from "path"
import { fileURLToPath } from "url"
import { usersRouter } from "./services/users/index.js"
import { categoriesRouter } from "./services/categories/index.js"
import { productsRouter } from "./services/products/index.js"
import { subCategoriesRouter } from "./services/subcategories/index.js"
import { cloudinaryRouter } from "./services/cloudinary/index.js"
import { couponsRouter } from "./services/coupons/index.js"
import { stripeRouter } from "./services/stripe/index.js"
import { adminsRouter } from "./services/admins/index.js"

import morgan from "morgan"

import {
  badRequestHandler,
  unauthorizedHandler,
  forbiddenHandler,
  notFoundHandler,
  genericErrorHandler,
} from "./errorHandlers.js"

const app = express()
const port = process.env.PORT || 3001

passport.use("google", googleStrategy)

// ***************************************** MIDDLEWARES **************************************

app.use(cors())
app.use(express.json({ limit: "50mb" }))
app.use(express.urlencoded({ limit: "50mb" }))
app.use(passport.initialize())
app.use(morgan("tiny"))

// ****************************************** ENDPOINTS ***************************************

app.use("/users", usersRouter)
app.use("/categories", categoriesRouter)
app.use("/subcategories", subCategoriesRouter)
app.use("/products", productsRouter)
app.use("/cloudinary", cloudinaryRouter)
app.use("/coupons", couponsRouter)
app.use("/stripe", stripeRouter)
app.use("/admins", adminsRouter)

// ***************************************** ERROR HANDLERS ***********************************

app.use(badRequestHandler)
app.use(unauthorizedHandler)
app.use(forbiddenHandler)
app.use(notFoundHandler)
app.use(genericErrorHandler)

mongoose.connect(process.env.MONGO_CONNECTION, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
})

mongoose.connection.on("connected", () => {
  console.log("Successfully connected to Mongo!")

  app.listen(port, () => {
    console.table(listEndpoints(app))
    console.log(`app running on port ${port}`)
  })
})
