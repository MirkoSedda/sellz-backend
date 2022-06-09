import productsModel from "./model.js"

export const handleQuery = async (req, res, next, query) => {
  const products = await productsModel
    .find({ $text: { $search: query } })
    .populate("category", "_id name")
    .populate("subCategories", "_id name")
    .populate("postedBy", "_id name")
  if (products) res.send(products)
}

export const handlePrice = async (req, res, next, price) => {
  const products = await productsModel
    .find({ price: { $gte: price[0], $lte: price[1] } })
    .populate("category", "_id name")
    .populate("subCategories", "_id name")
    .populate("postedBy", "_id name")
  if (products) res.send(products)
}

export const handleCategory = async (req, res, next, category) => {
  const products = await productsModel
    .find({ category })
    .populate("category", "_id name")
    .populate("subCategories", "_id name")
    .populate("postedBy", "_id name")
  if (products) res.send(products)
}

export const handleRating = async (req, res, next, stars) => {
  const rating = await productsModel.aggregate([
    {
      $project: {
        document: "$$ROOT",
        flooredAverage: {
          $floor: {
            $avg: "$ratings.star",
          },
        },
      },
    },
    { $match: { flooredAverage: stars } },
  ])
  const products = await productsModel
    .find({ _id: rating })
    .populate("category", "_id name")
    .populate("subCategories", "_id name")
    .populate("postedBy", "_id name")
  if (products) res.send(products)
  console.log(
    "🚀 ~ file: search&filter.js ~ line 49 ~ handleRating ~ products",
    products
  )
}

export const handleSubCategory = async (req, res, next, subCategory) => {
  const products = await productsModel
    .find({ subCategories: subCategory })
    .populate("category", "_id name")
    .populate("subCategories", "_id name")
    .populate("postedBy", "_id name")
  if (products) res.send(products)
}
export const handleShipping = async (req, res, next, shipping) => {
  const products = await productsModel
    .find({ shipping })
    .populate("category", "_id name")
    .populate("subCategories", "_id name")
    .populate("postedBy", "_id name")
  if (products) res.send(products)
}
export const handleColor = async (req, res, next, color) => {
  const products = await productsModel
    .find({ color })
    .populate("category", "_id name")
    .populate("subCategories", "_id name")
    .populate("postedBy", "_id name")
  if (products) res.send(products)
}
export const handleBrand = async (req, res, next, brand) => {
  const products = await productsModel
    .find({ brand })
    .populate("category", "_id name")
    .populate("subCategories", "_id name")
    .populate("postedBy", "_id name")
  if (products) res.send(products)
}
