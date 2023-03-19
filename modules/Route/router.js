const hasRole = require('../../middlewares/hasRole');
const middleware = require('../../middlewares/validation');
const auth = require('../../utils/auth');
const authCheck = auth.jwt;

/* ----------------- import ----------------- */
var multer = require("multer");
var excelStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/excelUploads');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});
var excelUploads = multer({ storage: excelStorage });
/* ----------------- import ----------------- */
var upload1 = multer({ dest: "uploads/import" });
var fileImport = upload1.fields([{ name: "uploadfile", maxCount: 1 }]);
/* ----------------- import ----------------- */

const {
  create, get, update, remove, stopUpdate, importRoute, dashboard
} = require('./controller')

module.exports = (app) => {
  app.post('/route', authCheck, hasRole([1, 2]), create);
  app.get('/route', authCheck, hasRole([1, 2, 3]), get);
  app.patch('/route/:_id', authCheck, hasRole([1, 2, 3]), update);
  app.delete('/route/:_id', authCheck, hasRole([1, 2]), remove);
  app.post('/route/stop', authCheck, hasRole([1, 2, 3]), stopUpdate);
  app.post('/route/importRoute', authCheck, hasRole([1, 2]), fileImport, importRoute);
  app.get('/admin/dashboard', authCheck, hasRole([1, 2]), dashboard);
};