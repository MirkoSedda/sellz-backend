// import mongoose from "mongoose"

// const { Schema, model } = mongoose

// const BlogSchema = new Schema(
//     {
//         category: { type: String, required: true },
//         title: { type: String, required: true },
//         cover: { type: String, required: true },
//         readTime: {
//             "value": { type: Number, required: true },
//             "unit": { type: String, required: true }
//         },
//         author: { type: Schema.Types.ObjectId, ref: "Author" },
//         content: { type: String, required: true },
//         comments: [
//             {
//                 "user": { type: String },
//                 "comment": { type: String },
//             },
//         ],
//     },
//     {
//         timestamps: true, // adds and manages automatically createdAt and updatedAt fields
//     }
// )

// export default model("Blog", BlogSchema) // this model is now automatically linked to the "users" collection, if the collection is not there it will be automatically created
