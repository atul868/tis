const hasRole = require('../../middlewares/hasRole');
const middleware = require('../../middlewares/validation');
const auth = require('../../utils/auth');
const authCheck = auth.jwt;

const { create, upcoming, history, complete, distancee, tracking, location, sos, getDriverLocation } = require('./controller')

module.exports = (app) => {
  app.post('/trip', authCheck, hasRole([4]), create);
  app.get('/trip/upcoming', authCheck, hasRole([1, 2, 3, 4, 5]), upcoming);
  app.get('/trip/history', authCheck, hasRole([1, 2, 3, 4, 5]), history);
  app.patch('/trip/complete/:_id', authCheck, hasRole([4]), complete);
  app.post('/trip/distancee', distancee);
  /* bus tracking admin */
  app.get('/trip/tracking', authCheck, hasRole([1, 2]), tracking);
  app.get('/trip/location', authCheck, hasRole([1, 2]), location);
  /*  */
  app.post('/trip/sos', authCheck, hasRole([4]), sos);
  app.get('/trip/getDriverLocation', authCheck, hasRole([1, 2, 4]), getDriverLocation);
};