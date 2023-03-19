const joi = require('joi');
exports.createNoticeValidate = joi.object({
  school: joi.string().hex().length(24),
  title: joi.string().optional(),
  description: joi.string().required(),
  date: joi.string().optional(),
});

exports.updateNoticeValidate = joi.object({
  id: joi.string().hex().length(24),
  school: joi.string().hex().length(24),
  title: joi.string().optional(),
  description: joi.string().optional(),
  date: joi.string().optional(),
});