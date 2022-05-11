import mongoose from "mongoose"
import bcrypt from "bcrypt"

const { Schema, model } = mongoose

const UserSchema = new Schema(
  {
    name: { type: String },
    surname: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    // avatar: { type: String },
    role: { type: String, enum: ["User", "Admin"], default: "User" },
  },
  {
    timestamps: true,
  }
)

UserSchema.pre("save", async function (next) {
  const newUser = this
  const password = newUser.password

  if (newUser.isModified("password")) {
    const hash = await bcrypt.hash(password, 10)
    newUser.password = hash
  }
  next()
})

UserSchema.methods.toJSON = function () {
  const userDocument = this
  const userObject = userDocument.toObject()

  delete userObject.password
  delete userObject.__v

  return userObject
}

UserSchema.statics.checkCredentials = async function (email, password) {
  const user = await this.findOne({ email })

  if (user) {
    const isMatch = await bcrypt.compare(password, user.password)

    if (isMatch) {
      return user
    } else {
      return null
    }
  } else {
    return null
  }
}

export default model("User", UserSchema)

// ************************* CUSTOM METHOD *********************************************
// we are going to attach a custom method to the schema and therefor everywhere we import the model we gonna have that method available

//bookSchema.static("findBooksWithAuthors", async function (mongoQuery) {
// If I use an arrow function here, "this" will result in an undefined value. If I use a normal function, "this" keyword will refer to the BooksModel itself

//     const total = await this.countDocuments(mongoQuery.criteria)
//     const books = await this.find(mongoQuery.criteria, mongoQuery.options.fields)
//         .limit(mongoQuery.options.limit || 20)
//         .skip(mongoQuery.options.skip || 0)
//         .sort(mongoQuery.options.sort) // no matter in which order you call this methods, Mongo will ALWAYS do SORT, SKIP, LIMIT in this order
//         .populate({ path: "authors", select: "firstName lastName" })

//     return { total, books }
// })

// Usage --> await BooksModel.findBooksWithAuthors(q2m(req.query))
