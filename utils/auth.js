const jwt = require('jsonwebtoken');
const config = require('../config/config');
const userModel = require('../modules/User/schema');
const bcrypt = require('bcrypt');

exports.generateTokenAdmin = function (user) {
  const userData = {
    userId: user,
  };
  console.log("user", userData);
  return jwt.sign(userData, config.secret, {
    expiresIn: 900, // expires in 15 minutes
  });
};

/** for super admin */
exports.generateToken = function (user) {
  const userData = {
    userId: user,
  };
  console.log("user", userData);
  return jwt.sign(userData, config.secret, {
    expiresIn: 8640000, // expires in 2400 hours 100 days
  });
};

exports.jwt = function (req, res, next) {
  const token = req.headers['authorization'];
  const result = token ? token.substr(token.indexOf(' ') + 1) : false;
  if (!result) {
    return res.status(403).send({ 'status': false, 'code': 403, 'message': 'Unauthorized !' });
  }
  jwt.verify(result, config.secret, async function (err, decoded) {

    if (decoded) {
      var userExist = await userModel.findById({ _id: decoded.userId.userId });
    }

    if (err) {
      return res.status(500).send({ 'status': false, 'code': 500, 'message': 'Failed to authenticate token. !' });
    }
    if (userExist) {
      if (userExist.group == 1) {
        req.isAdmin = true;
      }
      req.user = userExist;
      return next();
    }
  });
};

exports.hashPasswordUsingBcrypt = function (plainTextPassword) {
  try {
    return bcrypt.hashSync(plainTextPassword, 10);
  } catch (error) {
    throw error;
  }
};