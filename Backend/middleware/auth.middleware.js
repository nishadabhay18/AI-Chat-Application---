import jwt from 'jsonwebtoken'
import UserModel from '../models/user.model.js'
import redisClient from '../services/redis.service.js'

export const authUser = async (req, res, next) => {
    try {
        const token = req.cookies?.token || req.headers.authorization.split(' ')[1]

        console.log("TOKEN:", token)

        if (!token) {
            return res.status(401).json({
                error: 'Authentication required'
            })
        }

        const isBlackListed = await redisClient.get(token)

        if (isBlackListed) {

            res.clearCookie('token')

            return res.status(400).send({
                error: 'Unauthorized user'
            })
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        console.log(decoded)  

        req.user = decoded

        next()

    } catch (err) {
        console.log("AUTH ERROR:", err)
        return res.status(401).json({
            message: err.message
        })
    }
}