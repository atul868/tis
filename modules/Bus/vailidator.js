const joi = require('joi'); 

exports.createValidation = joi.object({ 
    school: joi.string().optional(),
    bus_number: joi.string().required(),
    route: joi.string().optional(),
    driver: joi.string().optional(),
    bus_rc: joi.optional(),
    bus_insurance: joi.optional(),
    bus_pollution_crt: joi.optional(),
    fitness: joi.optional(),
    tax: joi.optional(),
});