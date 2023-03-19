const hasRole = require('../../middlewares/hasRole');
const middleware = require('../../middlewares/validation');
const auth = require('../../utils/auth');
const authCheck = auth.jwt;

const { create, get, edit, remove,
} = require('./controller')

const { createHelpVailidate } = require('./vailidator')

module.exports = (app) => {
    app.post('/help/', authCheck, middleware(createHelpVailidate), hasRole([1]), create);
    app.get('/help/', authCheck, hasRole([1, 2, 3, 4, 5]), get);
    app.patch('/help/:_id', authCheck, hasRole([1]), edit);
    app.delete('/help/:_id', authCheck, hasRole([1]), remove);
};