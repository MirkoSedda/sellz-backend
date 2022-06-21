import express from "express"
import { JWTAuthMiddleware } from "../../auth/JWTAuthMiddleware.js"
import { adminOnlyMiddleware } from "../../auth/adminOnlyMiddleware.js"
import cloudinary from "cloudinary"

export const cloudinaryRouter = express.Router()

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

cloudinaryRouter.post(
  "/upload-images",
  JWTAuthMiddleware,
  adminOnlyMiddleware,
  async (req, res, next) => {
    try {
      const image = await cloudinary.v2.uploader.upload(req.body.image, {
        public_id: `${Date.now()}`,
        resource_type: "auto", // jpeg, png
      })
      res.json({
        public_id: image.public_id,
        url: image.secure_url,
      })
    } catch (error) {
      next(error)
      console.log(error)
    }
  }
)

cloudinaryRouter.post(
  "/delete-image",
  JWTAuthMiddleware,
  adminOnlyMiddleware,
  (req, res, next) => {
    try {
      const image_id = req.body.public_id
      cloudinary.v2.uploader.destroy(image_id, error => {
        if (error) return res.json({ success: false, error: error })
      })
      res.json({ message: "Image deleted successfully" })
    } catch (error) {
      next(error)
      console.log(error)
    }
  }
)
