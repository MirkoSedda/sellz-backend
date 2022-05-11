// import express from 'express'
// import createError from 'http-errors'
// import blogsModel from '../blogs/model.js'

// const commentsRouter = express.Router()

// commentsRouter.post('/:blogId/comments', async (req, res, next) => {
//     try {
//         const blog = await blogsModel.findById(req.params.blogId, { _id: 0 })
//         console.log(blog)
//         if (blog) {
//             const comments = req.body
//             console.log(comments)
//             const commentToInsert = {
//                 ...comments,
//                 commentDate: new Date(),
//             }
//             const modifiedBlog = await blogsModel.findByIdAndUpdate(
//                 req.params.blogId,
//                 { $push: { comments: commentToInsert } },
//                 { new: true }
//             )
//             if (modifiedBlog) res.send(modifiedBlog)
//             else next(createError(404, `Blog with id ${req.params.userId} not found!`))
//         } else {
//             next(createError(404, `Blog with id ${req.body.bookId} has no comments!`))
//         }
//     } catch (error) {
//         next(error)
//     }
// })

// commentsRouter.get("/:blogId/comments", async (req, res, next) => {
//     try {
//         const blog = await blogsModel.findById(req.params.blogId)
//         if (blog) {
//             res.send(blog.comments)
//         } else {
//             next(createError(404, `Blog with id ${req.params.userId} not found!`))
//         }
//     } catch (error) {
//         next(error)
//     }
// })

// commentsRouter.get("/:blogId/comments/:commentId", async (req, res, next) => {
//     try {
//         const blog = await blogsModel.findById(req.params.blogId)
//         if (blog) {
//             const comment = blog.comments.find(comment => comment._id.toString() === req.params.commentId)

//             if (comment) {
//                 res.send(comment)
//             } else {
//                 next(createError(404, `Comment with id ${req.params.commentId} is not found!`))
//             }
//         } else {
//             next(createError(404, `Blog with id ${req.params.blogId} isnot found!`))
//         }
//     } catch (error) {
//         next(error)
//     }
// })

// commentsRouter.put("/:blogId/comments/:commentId", async (req, res, next) => {
//     try {
//         const blog = await blogsModel.findById(req.params.blogId)
//         if (blog) {
//             const index = blog.comments.findIndex(comment => comment._id.toString() === req.params.commentId)

//             if (index !== -1) {
//                 blog.comments[index] = { ...blog.comments[index].toObject(), ...req.body }

//                 await blog.save()

//                 res.send(blog)
//             } else {
//                 next(createError(404, `Blog with id ${req.params.blogId} is not found!`))
//             }
//         } else {
//             next(createError(404, `Comment with id ${req.params.commentId} is not found!`))
//         }
//     } catch (error) {
//         next(error)
//     }
// })

// commentsRouter.delete("/:blogId/comments/:commentId", async (req, res, next) => {
//     try {
//         const blogToModify = await blogsModel.findByIdAndUpdate(
//             req.params.blogId,
//             { $pull: { comments: { _id: req.params.commentId } } },
//             { new: true }
//         )

//         if (blogToModify) {
//             res.send(blogToModify)
//         } else {
//             next(createError(404, `Blog with id ${req.params.blogId} is not found!`))
//         }
//     } catch (error) {
//         next(error)
//     }
// })

// export default commentsRouter
