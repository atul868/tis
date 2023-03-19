const response = require('../utils/response');
const message = require("../utils/message");
const compose = require('composable-middleware');

const hasRole = roleRequired => {
  if (roleRequired === undefined)
    throw new Error('Required role needs to be set');
  return compose().use((req, res, next) => {
    let requiredRoles = roleRequired;
    if ((req.isAdmin || requiredRoles.indexOf(req.user.group) >= 0)) {
      next();
    } else {
      res.status(422).json(response.failure(422, { "message": "You do not authorization for accessing this module." }));
    }
  });
};

module.exports = hasRole;
