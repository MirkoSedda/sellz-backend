import express from "express"
import uniqid from "uniqid"
import passport from "passport"
import createError from "http-errors"
import usersModel from "./model.js"
import cartModel from "../cart/model.js"
import productsModel from "../products/model.js"
import couponsModel from "../coupons/model.js"
import orderModel from "../orders/model.js"
import { generateAccessToken } from "../../auth/tools.js"
import { JWTAuthMiddleware } from "../../auth/JWTAuthMiddleware.js"
import { adminOnlyMiddleware } from "../../auth/adminOnlyMiddleware.js"

export const usersRouter = express.Router()

usersRouter.post("/cart", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const { cart } = req.body
    const { _id } = req.user

    const previousUserCart = await cartModel.findOne({ orderedBy: _id })

    if (previousUserCart) {
      previousUserCart.remove()
    }

    const products = []

    for (let i = 0; i < cart.length; i++) {
      let object = {}
      object.product = cart[i]._id
      object.count = cart[i].count
      object.color = cart[i].color
      let productFromDb = await productsModel
        .findById(cart[i]._id)
        .select("price")
      object.price = productFromDb.price

      products.push(object)
      console.log("🚀 ~ file: index.js ~ line 31 ~ products", products)
    }

    let cartTotal = 0

    for (let i = 0; i < products.length; i++) {
      cartTotal = cartTotal + products[i].price * products[i].count
    }
    console.log("🚀 ~file: index.js ~line 47 ~cartTotal", cartTotal)

    const newCart = await new cartModel({
      products,
      cartTotal,
      orderedBy: _id,
      // totalAfterDiscount,
    })
    await newCart.save()
    console.log("🚀 ~ file: index.js ~ line 59 ~ newCart", newCart)
    if (newCart) res.status(201).send(newCart)
  } catch (error) {
    next(error)
  }
})

usersRouter.get("/cart", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const { _id } = req.user

    let cart = await cartModel
      .findOne({ orderedBy: _id })
      .populate("products.product")
    console.log("🚀 ~ file: index.js ~ line 70 ~ usersRouter.get ~ cart", cart)

    res.status(201).send(cart)
  } catch (error) {
    next(error)
  }
})

usersRouter.delete("/cart", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const { _id } = req.user

    const cart = await cartModel.findOneAndRemove({ orderedBy: _id })

    res.status(201).send(cart)
  } catch (error) {
    next(error)
  }
})

usersRouter.post("/cart/coupon", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const { coupon } = req.body
    console.log("🚀 ~ file: index.js ~ line 111 ~ coupon", coupon)

    const couponFromDb = await couponsModel.findOne({ name: coupon })
    console.log("🚀 ~ file: index.js ~ line 114 ~ couponFromDb", couponFromDb)

    const { _id } = await usersModel.findById(req.user._id)
    console.log("🚀 ~ file: index.js ~ line 117 ~ _id", _id)

    const fullPriceCart = await cartModel.findOne({ orderedBy: _id })
    console.log("🚀 ~ file: index.js ~ line 122 ~ fullPriceCart", fullPriceCart)

    const cartTotal = fullPriceCart.cartTotal
    console.log("🚀 ~ file: index.js ~ line 126 ~ cartTotal", cartTotal)

    const totalAfterDiscount = (
      cartTotal -
      (cartTotal * couponFromDb.discount) / 100
    ).toFixed(2)
    console.log(
      "🚀 ~ file: index.js ~ line 132 ~ totalAfterDiscount",
      totalAfterDiscount
    )

    const cart = await cartModel.findOneAndUpdate(
      { orderedBy: _id },
      { totalAfterDiscount },
      { new: true }
    )
    console.log("🚀 ~ file: index.js ~ line 139 ~ cart", cart)

    if (cart) {
      res.send(cart)
    } else {
      next(401, `Something went wrong !`)
    }
  } catch (error) {
    next(error)
  }
})

usersRouter.post("/order", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const { paymentIntent } = req.body.stripeResponse
    console.log(
      "🚀 ~ file: index.js ~ line 137 ~ usersRouter.post ~ paymentIntent",
      paymentIntent
    )

    const { _id } = req.user
    console.log("🚀 ~ file: index.js ~ line 140 ~ _id", _id)

    const { products } = await cartModel.findOne({ orderedBy: _id })
    console.log("🚀 ~ file: index.js ~ line 143 ~ products", products)

    const newOrder = await new orderModel({
      products,
      paymentIntent,
      orderedBy: _id,
    }).save()
    console.log("🚀 ~ file: index.js ~ line 150 ~ newOrder", newOrder)

    const bulkUpdate = products.map(item => {
      return {
        updateOne: {
          filter: { _id: item.product._id },
          update: { $inc: { quantity: -item.count, sold: +item.count } },
        },
      }
    })

    await productsModel.bulkWrite(bulkUpdate, {})

    if (newOrder) {
      res.send({ ok: true })
    } else {
      next(401, `Failed to create the order`)
    }
  } catch (error) {
    next(error)
  }
})

usersRouter.get("/orders", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const { _id } = req.user

    const orders = await orderModel
      .find({ orderedBy: _id })
      .populate("products.product")

    if (orders) res.send(orders)
  } catch (error) {
    next(error)
  }
})

usersRouter.delete("/order", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const { _id } = req.user

    const cart = await cartModel.findOneAndRemove({ orderedBy: _id })
    console.log(
      "🚀 ~ file: index.js ~ line 192 ~ usersRouter.delete ~ cart",
      cart
    )

    if (cart) {
      res.send(cart)
    } else {
      next(401, `Cart not found!`)
    }
  } catch (error) {
    next(error)
  }
})

usersRouter.post("/cash-order", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const { _id } = req.user

    const { CashOnDelivery, couponApplied } = req.body

    const cart = await cartModel.findOne({ orderedBy: _id })
    console.log(
      "🚀 ~ file: index.js ~ line 212 ~ usersRouter.post ~ cart",
      cart
    )

    let finalAmount = 0

    if (couponApplied && cart.totalAfterDiscount) {
      finalAmount = (cart.totalAfterDiscount * 100).toFixed(0)
    } else {
      finalAmount = (cart.cartTotal * 100).toFixed(0)
    }

    const newOrder = await new orderModel({
      products: cart.products,
      paymentIntent: {
        id: uniqid(),
        amount: finalAmount,
        currency: "EUR",
        status: "Cash on delivery",
        created: Date.now(),
        payment_method_types: ["cash"],
      },
      orderedBy: _id,
      orderStatus: "Cash on delivery",
    }).save()
    console.log(
      "🚀 ~ file: index.js ~ line 226 ~ usersRouter.post ~ newOrder",
      newOrder
    )

    const bulkUpdate = cart.products.map(item => {
      return {
        updateOne: {
          filter: { _id: item.product._id },
          update: { $inc: { quantity: -item.count, sold: +item.count } },
        },
      }
    })

    await productsModel.bulkWrite(bulkUpdate, {})

    if (newOrder) {
      res.send({ ok: true })
    } else {
      next(401, `Failed to create the order`)
    }
  } catch (error) {
    next(error)
  }
})

usersRouter.post("/wishlist", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const { _id } = req.user
    const { productId } = req.body

    const wishlist = await usersModel.findByIdAndUpdate(
      _id,
      {
        $addToSet: { wishlist: productId },
      },
      { new: true }
    )

    console.log(
      "🚀 ~ file: index.js ~ line 275 ~ usersRouter.post ~ wishlist",
      wishlist
    )

    if (wishlist) {
      res.send(wishlist)
    } else {
      next(401, `User with id ${req.user._id} not found!`)
    }
  } catch (error) {
    next(error)
  }
})

usersRouter.get("/wishlist", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const { _id } = req.user

    const wishlist = await usersModel
      .findById(_id)
      .select("wishlist")
      .populate({ path: "wishlist", populate: { path: "product" } })
    console.log(
      "🚀 ~ file: index.js ~ line 298 ~ usersRouter.get ~ wishlist",
      wishlist
    )

    if (wishlist) res.send(wishlist)
  } catch (error) {
    next(error)
  }
})

usersRouter.put(
  "/wishlist/:productId",
  JWTAuthMiddleware,
  async (req, res, next) => {
    try {
      const { productId } = req.params

      const { _id } = req.user

      const wishlist = await usersModel.findOneAndUpdate(_id, {
        $pull: { wishlist: productId },
      })

      if (wishlist) {
        res.send(wishlist)
      } else {
        next(401, `User with id ${req.user._id} not found!`)
      }
    } catch (error) {
      next(error)
    }
  }
)

// TODO adopt the same req.user._id without the user in params
usersRouter.post("/address", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const userAddress = await usersModel.findByIdAndUpdate(
      req.user._id,
      req.body,
      {
        new: true,
      }
    )
    if (userAddress) {
      res.send(userAddress)
    } else {
      next(401, `User with id ${req.user._id} not found!`)
    }
  } catch (error) {
    next(error)
  }
})

usersRouter.post("/register", async (req, res, next) => {
  try {
    const newUser = new usersModel(req.body)
    const { _id } = await newUser.save()
    res.status(201).send({ _id })
  } catch (error) {
    next(error)
  }
})

usersRouter.post("/login", async (req, res, next) => {
  try {
    console.log("req.body: ", req.body)
    const { email, password } = req.body
    const user = await usersModel.checkCredentials(email, password)
    if (user) {
      const accessToken = await generateAccessToken({
        _id: user._id,
        role: user.role,
      })
      res.send({ user, accessToken })
    } else {
      next(createError(401, `Credentials are not valid!`))
    }
  } catch (error) {
    next(error)
  }
})

usersRouter.get("/me", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const user = await usersModel.findById(req.user._id)
    if (user) {
      res.send(user)
    } else {
      next(401, `User with id ${req.user._id} not found!`)
    }
  } catch (error) {
    next(error)
  }
})

usersRouter.put("/me", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const modifiedUser = await usersModel.findByIdAndUpdate(
      req.user._id,
      req.body,
      {
        new: true,
      }
    )
    if (modifiedUser) {
      res.send(modifiedUser)
    } else {
      next(401, `User with id ${req.user._id} not found!`)
    }
  } catch (error) {
    next(error)
  }
})

usersRouter.delete("/me", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const deletedUser = await usersModel.findByIdAndDelete(req.user._id)
    if (deletedUser) {
      res.send()
    } else {
      next(401, `User with id ${req.user._id} not found!`)
    }
  } catch (error) {
    next(error)
  }
})

usersRouter.get(
  "/googleLogin",
  passport.authenticate("google", { scope: ["profile", "email"] })
)

usersRouter.get(
  "/googleRedirect",
  passport.authenticate("google"),
  async (req, res, next) => {
    try {
      console.log("Token: ", req.user.token)
      if (req.user.role === "Admin") {
        res.redirect(
          `${process.env.FE_URL}/adminDashboard?accessToken=${req.user.token}`
        )
      } else {
        res.redirect(
          `${process.env.FE_URL}/profile?accessToken=${req.user.token}`
        )
      }
    } catch (error) {
      next(error)
    }
  }
)

usersRouter.get(
  "/",
  JWTAuthMiddleware,
  adminOnlyMiddleware,
  async (req, res, next) => {
    try {
      const users = await usersModel.find()
      res.send(users)
    } catch (error) {
      next(error)
    }
  }
)

usersRouter.get(
  "/:userId",
  JWTAuthMiddleware,
  adminOnlyMiddleware,
  async (req, res, next) => {
    try {
      const user = await usersModel.findById(req.params.userId)
      if (user) {
        res.send(user)
      } else {
        next(createError(404, `User with id ${req.params.userId} not found!`))
      }
    } catch (error) {
      next(error)
    }
  }
)

usersRouter.put(
  "/:userId",
  JWTAuthMiddleware,
  adminOnlyMiddleware,
  async (req, res, next) => {
    try {
      const updatedUser = await usersModel.findByIdAndUpdate(
        req.params.userId,
        req.body,
        { new: true, runValidators: true }
      )
      if (updatedUser) {
        res.send(updatedUser)
      } else {
        next(createError(404, `User with id ${req.user._id} not found!`))
      }
    } catch (error) {
      next(error)
    }
  }
)

usersRouter.delete(
  "/:userId",
  JWTAuthMiddleware,
  adminOnlyMiddleware,
  async (req, res, next) => {
    try {
      const deletedUser = await usersModel.findByIdAndDelete(req.params.userId)
      if (deletedUser) {
        res.status(204).send()
      } else {
        next(createError(404, `User with id ${req.params.userId} not found!`))
      }
    } catch (error) {
      next(error)
    }
  }
)
