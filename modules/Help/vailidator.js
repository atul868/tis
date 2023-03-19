const joi = require('joi');
exports.createHelpVailidate = joi.object({
    title:joi.string().required(),
    description:joi.string().required()
});

