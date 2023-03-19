const hasRole = require('../../middlewares/hasRole');
const middleware = require('../../middlewares/validation');
const auth = require('../../utils/auth');
const authCheck = auth.jwt;

const { create, get, update, remove, getLeaveStudent } = require('./controller')

module.exports = (app) => {
  app.post('/feedback', authCheck, hasRole([1, 2, 5]), create);
  app.get('/feedback', authCheck, hasRole([1, 2, 5]), get);
  app.put('/feedback', authCheck, hasRole([1, 2]), update);
  app.delete('/feedback/:id', authCheck, hasRole([1, 2]), remove);
  app.get('/getLeaveStudent', authCheck, hasRole([1, 2, 3, 4, 5]), getLeaveStudent);
}