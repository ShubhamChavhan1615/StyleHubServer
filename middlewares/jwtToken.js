import jwt from "jsonwebtoken"

const jwtExpire = process.env.JWT_EXPIRE
const jwtSecret = process.env.JWT_SECRET

const generateToken = (id) => {
    return jwt.sign({ id }, jwtSecret, { expiresIn: jwtExpire })
}

export default generateToken;