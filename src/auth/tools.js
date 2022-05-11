import jwt from "jsonwebtoken"

export const generateAccessToken = payload =>
  new Promise((resolve, reject) =>
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "1 week" },
      (err, token) => {
        if (err) reject(err)
        else resolve(token)
      }
    )
  )

export const verifyAccessToken = token =>
  new Promise((resolve, reject) =>
    jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
      if (err) reject(err)
      else resolve(payload)
    })
  )

//open powershell
//node + enter
//require("crypto").randomBytes(64).toString("hex")

// usage with Promises generateAccessToken({}).then(token => console.log(token)).catch(err => console.log(err))

/* usage with Async/Await
  try {
    const token = await generateAccessToken({})
  } catch(err){
    console.log(err)
  }
  
  */
