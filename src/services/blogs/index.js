// import express from 'express'
// import createError from 'http-errors'
// import blogsModel from './model.js'
// import q2m from 'query-to-mongo'
// import authorsSchema from '../authors/model.js'

// const blogsRouter = express.Router()

// blogsRouter.get("/", async (req, res, next) => {
//     try {
//         const mongoQuery = q2m(req.query);
//         const total = await blogsModel.countDocuments(mongoQuery.criteria);
//         const blogs = await blogsModel
//             .find(mongoQuery.criteria, mongoQuery.options.fields)
//             .sort(mongoQuery.options.sort) //Mongo will ALWAYS do SORT, SKIP, LIMIT no matter what!
//             .skip(mongoQuery.options.skip, 0)
//             .limit(mongoQuery.options.limit, 20)
//             .populate({ path: "author" })
//         res.send({
//             links: mongoQuery.links(`http://localhost:3001/blogs`, total),
//             total,
//             totalPages: Math.ceil(total / mongoQuery.options.limit),
//             blogs,
//         });
//     } catch (error) {
//         next(error);
//     }
// });

// blogsRouter.post('/', async (req, res, next) => {
//     try {
//         const newBlog = new blogsModel(req.body)
//         const { _id } = await newBlog.save()
//         res.status(201).send({ _id })
//     } catch (error) {
//         next(error)
//         console.log(error)
//     }
// })


// blogsRouter.get('/:blogId', async (req, res, next) => {
//     try {
//         const blog = await blogsModel.findById(req.params.blogId)
//         if (blog) res.send(blog)
//         else next(createError(404), `blog with the ID ${req.params.blogId} is not found.`)

//     } catch (error) {
//         next(error)
//         console.log(error)
//     }
// })

// blogsRouter.put('/:blogId', async (req, res, next) => {
//     try {
//         const updatedBlog = await blogsModel.findByIdAndUpdate(
//             req.params.blogId, // WHO
//             req.body, // HOW
//             { new: true, runValidators: true } // OPTIONS by default findByIdAndUpdate returns the record pre-modification, if you want to get back the newly updated record you should use the option new: true
//             // by default validation is off here, if you want to have it --> runValidators: true as an option
//         )

//         // ****************** ALTERNATIVE METHOD *******************
//         // const blog = await blogsModel.findById(req.params.blogId)

//         // blog.firstName = "John"

//         // await blog.save()

//         if (updatedBlog) res.send(updatedBlog)
//         else next(createError(404, `blog with id ${req.params.blogId} not found!`))

//     } catch (error) {
//         next(error)
//     }
// })

// blogsRouter.delete('/:blogId', async (req, res, next) => {
//     try {
//         const deletedBlogs = await blogsModel.findByIdAndDelete(req.params.blogId)
//         if (deletedBlogs) res.status(204).send()
//         else next(createError(404, `Blog with id ${req.params.blogId} not found!`))
//     } catch (error) {
//         next(error)
//         console.log(error)
//     }
// })





// export default blogsRouter