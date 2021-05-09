const Jwt = require("jsonwebtoken")
const {secret} = require("../config/config");

module.exports = {
    create: (data) => {
        return Jwt.sign({...data}, secret)
    },
    createExpiry: (data, expiry) => {
        return Jwt.sign({...data}, secret, {
            expiresIn: expiry
        })
    },
    verify: (token) => {
        return Jwt.verify(token, secret);
    }
}