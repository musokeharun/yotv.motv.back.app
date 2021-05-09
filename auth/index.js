const express = require('express');
const router = express.Router();
const Joi = require("joi");
const JoiValidate = require("../utils/joi");
const {baseEmails, bcrpytRounds} = require("../config/config");
const Db = require("../db/index")
const bcrypt = require("bcryptjs")
const _ = require("lodash");
const Jwt = require("../auth/jwt");

const createAuthToken = (user, ip, perms) => {
    const session = {
        user,
        ip,
        perms,
        createdAt: new Date().getTime(),
        modifiedAt: new Date().getTime()
    }

    return Jwt.createExpiry(session, "3h")
}

const validateReq = async (req, res) => {
    const schema = Joi.object().keys({
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
    })
    let result = await JoiValidate(schema, req.body);
    if (result) {
        res.status(404);
        res.json(result);
        return;
    }

    const {email, password} = req.body;
    let emailParts = email.split("@")
    if (emailParts.length !== 2) {
        res.status(404);
        res.json({
            email: "Format not allowed"
        })
        return;
    }

    if (!baseEmails.includes(emailParts[1])) {
        res.status(404);
        res.json({
            email: "Domain not allowed"
        })
        return;
    }
}

// middleware that is specific to this router
router.use(function timeLog(req, res, next) {
    next()
})

router.all((req, res) => {
    res.send("Not allowed")
})

// define the home page route
router.post('/register', (req, res) => {
    validateReq(req, res).then(r => {
    })

    const {email, password} = req.body;
    const salt = bcrypt.genSaltSync(bcrpytRounds);
    const encodedPassword = bcrypt.hashSync(password, salt);

    Db.ready(() => {
        const saver = async () => {
            const user = {
                email: email,
                password: encodedPassword
            }
            try {
                console.log("Saving user..........")
                await Db.table("users").save(user);
                let token = createAuthToken(user.email, req.ip, 1100) || "";
                res.set("X-ADMIN-KEY", token);
                res.send("Registered Successfully")
            } catch (e) {
                if (e.sqlMessage) {

                    let message = _.split(e.sqlMessage, " ").slice(0, 3).join(" ")
                    res.status(417).send(message);

                } else
                    res.status(500).send("Could not register,try again");
            }
        }
        saver().then(r => {
        });
    })
})

// define the about route
router.post('/login', function (req, res) {
    validateReq(req, res).then(r => {
    })

    const {email, password} = req.body;

    Db.ready(function () {

        const verifier = async () => {
            try {
                let user = Db.table("users").findSingle({email});
            } catch (e) {

            }
        }

    })
    res.send('Login page')
})

router.post("/save", ((req, res) => {
    res.send("Reached")
}))
module.exports = router