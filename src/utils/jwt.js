const jwt = require('jsonwebtoken')
const createError = require('http-errors')

require('dotenv').config()

const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET

module.exports = {
    signAccessToken(payload) {
        return new Promise((resolve, reject) => {
            console.log('payload', payload)
            jwt.sign(
                { 'email': payload.email },
                accessTokenSecret,
                { expiresIn: '30s' },
            (err, token) => {
                console.log('err', err)
                console.log('token', token)
                if ( err ) reject(createError.InternalServerError())

                resolve(token)
            })
        })
    },
    signRefreshToken(payload) {
        return new Promise((resolve, reject) => {
            console.log('payload', payload)
            jwt.sign(
                { 'email': payload.email },
                refreshTokenSecret,
                { expiresIn: '4h' },
            (err, token) => {
                console.log('err', err)
                console.log('token', token)
                if ( err ) reject(createError.InternalServerError())

                resolve(token)
            })
        })
    },
    verifyAccessToken(token) {
        return new Promise((resolve, reject) => {
            jwt.verify(token, accessTokenSecret, (err, payload) => {
                console.log('payload')
                if (err) {
                    const message = err.name == 'JsonWebTokenError' ? 'Unauthorized' : err.message
                    return reject(createError.Unauthorized(message))
                }
                resolve(payload)
            })
        })
    }
}