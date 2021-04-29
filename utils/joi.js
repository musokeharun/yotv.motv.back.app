const Joi = require('joi');

const validate = async function (schema, data) {
    try {
        await Joi.validate(data, schema);
        return null;
    } catch (e) {
        if (!e.isJoi || !e.details) return e;
        return (e.details.map(({message, path}) => {
            let field = path[0];
            return {
                field: message
            }
        }))
    }
}

module.exports = validate;