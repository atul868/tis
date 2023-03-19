const hasRole = require('../../middlewares/hasRole');
const middleware = require('../../middlewares/validation');
const auth = require('../../utils/auth');
const authCheck = auth.jwt;

const { createNotice, getNotice, updateNotice, deleteNotice } = require('./controller')
const { createNoticeValidate, updateNoticeValidate } = require('./vailidator')

module.exports = (app) => {
  app.post('/notice', authCheck, hasRole([1, 2]), middleware(createNoticeValidate), createNotice);
  app.get('/notice', authCheck, hasRole([1, 2, 5]), getNotice);
  app.put('/notice', authCheck, hasRole([1, 2]), middleware(updateNoticeValidate), updateNotice);
  app.delete('/notice/:id', authCheck, hasRole([1, 2]), deleteNotice);
}