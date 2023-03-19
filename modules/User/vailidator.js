const joi = require('joi');


exports.driverCreate = joi.object({
  school: joi.string().hex().length(24),
  mobile: joi.number().required(),
  name: joi.string().required(),
  address: joi.object().optional(),
  driverDetails: joi.object().optional(),
  location: joi.object().optional(),
});

exports.surveyorCreate = joi.object({
  school: joi.string().hex().length(24).optional(),
  mobile: joi.number().required(),
  name: joi.string().required(),
  force: joi.string().optional(),
});
// route: joi.array().optional(joi.string()).optional(),