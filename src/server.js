import express from "express"
import mongoose from "mongoose"
import listEndpoints from "express-list-endpoints"
import cors from "cors"
import passport from "passport"
import googleStrategy from "./auth/OAuth.js"

// import blogsRouter from "./services/blogs/index.js"
// import commentsRouter from "./services/comments/index.js"
// import authorsRouters from "./services/authors/index.js"
import {
  badRequestHandler,
  unauthorizedHandler,
  forbiddenHandler,
  notFoundHandler,
  genericErrorHandler,
} from "./errorHandlers.js"

const server = express()
const port = process.env.PORT || 3001

passport.use("google", googleStrategy)

// ***************************************** MIDDLEWARES **************************************

server.use(cors())
server.use(express.json())
server.use(passport.initialize())

// ****************************************** ENDPOINTS ***************************************

// server.use("/blogs", [blogsRouter, commentsRouter])
server.use("/users", usersRouters)

// ***************************************** ERROR HANDLERS ***********************************

server.use(badRequestHandler)
server.use(unauthorizedHandler)
server.use(forbiddenHandler)
server.use(notFoundHandler)
server.use(genericErrorHandler)

mongoose.connect(process.env.MONGO_CONNECTION)

mongoose.connection.on("connected", () => {
  console.log("Successfully connected to Mongo!")

  server.listen(port, () => {
    console.table(listEndpoints(server))
    console.log(`Server running on port ${port}`)
  })
})
