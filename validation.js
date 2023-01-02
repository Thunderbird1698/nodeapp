//Validation
const joi = require('@hapi/joi');

const regisvalidation = data => {
    const schema = joi.object({
        firstname: joi.string().min(2),
        lastname: joi.string().min(2),
        email: joi.string().min(6).email({ minDomainSegments: 2}),
        password: joi.string().min(6)
    });
    return schema.validateAsync(data)
};

module.exports.regisvalidation = regisvalidation;