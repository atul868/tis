const hasRole = require('../../middlewares/hasRole');
const middleware = require('../../middlewares/validation');
const auth = require('../../utils/auth');
const authCheck = auth.jwt;


const {
  create, get, update, remove, assignDriver
} = require('./controller')

const { createValidation } = require('./vailidator')

module.exports = (app) => {
  app.post('/bus', authCheck, hasRole([1, 2]), middleware(createValidation), create);
  app.get('/bus', authCheck, hasRole([1, 2]), get);
  app.patch('/bus/:_id', authCheck, hasRole([1, 2]), update);
  app.delete('/bus/:_id', authCheck, hasRole([1, 2]), remove);
  app.patch('/bus/assignDriver/:_id', authCheck, hasRole([1, 2]), assignDriver);
};