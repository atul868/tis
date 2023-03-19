
const hasRole = require('../../middlewares/hasRole');
const middleware = require('../../middlewares/validation');
const auth = require('../../utils/auth');
const authCheck = auth.jwt;

/* -------------- common file upload --------------- */
var fs = require("fs");
var multer = require("multer");
const path = require("path");

var dir = path.resolve("./uploads");
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({
  storage: storage
});

// const upload = multer({ dest: "uploads/" });
// const imageUpload = upload.fields([{ name: "profileImage", maxCount: 1 }]);
/* -------------- common file upload --------------- */

/* ----------------- import ----------------- */
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

/* controller*/
const { login, otpLogin, verifyOtp, resendOtp, school, surveyor, driver, removeSurveyor,
  student, updateSchoolAdmin, updateSurveyor, updateDriver, updateStudent, updateSchool,/*allUsers,*/
  importStudent, importDriver, files, schoolAdmin, updateDriverLocation, getSchoolAdmin, /*removeSchool,*/
  getSurveyor, getDriver, getStudent, updateDeviceToken, getSchool, removeDriver, removeStudent
} = require('./controller')

/* validator */
const { driverCreate, surveyorCreate } = require('./vailidator')

module.exports = (app) => {

  app.post('/login', login);
  app.post('/otpLogin', otpLogin);
  app.post('/verifyOtp', /*middleware(verifyOtpValidate),*/ verifyOtp);
  app.post('/resendOtp', /*middleware(resendOtpValidate),*/ resendOtp);

  app.post('/school', authCheck, hasRole([1]), school);
  app.post('/schoolAdmin', authCheck, hasRole([1]), schoolAdmin);
  app.post('/surveyor', authCheck, hasRole([1]), middleware(surveyorCreate), surveyor);
  app.post('/driver', authCheck, hasRole([1, 2]), middleware(driverCreate), driver);
  app.post('/student', authCheck, hasRole([1, 2]), student);

  app.patch('/school/:_id', authCheck, hasRole([1, 2]), updateSchool);
  app.patch('/schoolAdmin/:_id', authCheck, hasRole([1, 2]), updateSchoolAdmin);
  app.patch('/surveyor/:_id', authCheck, hasRole([1, 2, 3]), updateSurveyor);
  app.patch('/driver/:_id', authCheck, hasRole([1, 2, 4]), updateDriver);
  app.patch('/student/:_id', authCheck, hasRole([1, 2, 5]), updateStudent);

  // app.get('/allUsers', authCheck, hasRole([1]), allUsers);
  app.get('/school', authCheck, hasRole([1]), getSchool);
  app.get('/schoolAdmin', authCheck, hasRole([1]), getSchoolAdmin);
  app.get('/surveyor', authCheck, hasRole([1, 2, 3]), getSurveyor);
  app.get('/driver', authCheck, hasRole([1, 2, 4]), getDriver);
  app.get('/student', authCheck, hasRole([1, 2, 3, 5]), getStudent);

  // app.delete('/school/:_id', authCheck, hasRole([1, 2]), removeSchool);
  app.delete('/driver/:_id', authCheck, hasRole([1, 2]), removeDriver);
  app.delete('/student/:_id', authCheck, hasRole([1, 2]), removeStudent);
  app.delete('/surveyor/:_id', authCheck, hasRole([1]), removeSurveyor);

  // app.post('/importStudent', authCheck, hasRole([1, 2]), excelUploads.single("uploadfile"), importStudent);
  app.post('/importStudent', authCheck, hasRole([1, 2]), fileImport, importStudent);
  app.post('/importDriver', authCheck, hasRole([1, 2]), excelUploads.single("uploadfile"), importDriver);

  app.post("/files", upload.any(), (req, res) => {
    let data = {
      files: req.files
    };
    files(data, res);
  });

  // app.patch('/location/:_id"', authCheck, hasRole([1, 4]), updateDriverLocation);

  app.patch("/location/:_id", authCheck, hasRole([1, 4]), (req, res) => {
    let data = req.body;
    data._id = req.params._id;
    data.io = req.app.get("io");
    updateDriverLocation(data, res);
  });

  app.put("/updateDeviceToken", authCheck, (req, res) => { // notification device token store
    let data = {
      body: req.body,
      params: req.params,
      userId: req.user._id,
    };
    updateDeviceToken(data, res);
  });

};