const jwt = require('jsonwebtoken');
const createError = require('http-errors');
require('dotenv').config()


const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;

const auth = async(req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).json({
            error: true,
            message: 'Unauthorized'
        });
    }    
    const token = authHeader.split(' ')[1];

    jwt.verify(
        token,
        accessTokenSecret,
        (err, token) => {
            console.log('tokentoken', token)
            if (err) {
                return res.status(403).json({
                    error: true,
                    message: 'Forbidden'
                });
            }
            req.user = token.email;
            next();
        }
    );
}

module.exports = auth