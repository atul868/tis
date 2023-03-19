const { string } = require("joi");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Location = new Schema(
  {
    lat: { type: Number },
    long: { type: Number },
    accuracy: { type: Number }
  },
  { _id: false, timestamps: true }
);

const Address = new Schema(
  {
    lineOne: { type: String },
    lineTwo: { type: String },
    country: { type: String, default: "India" },
    state: { type: String },
    city: { type: String },
    pincode: { type: Number, minlength: 6, maxlength: 6 },
    locality: { type: String },
    // location: { type: Location },
    // lat: { type: Number },
    // long: { type: Number },
    // accuracy: { type: Number }
  }, { _id: false }
);

// const License = new Schema(
//   {
//     exp_date: { type: Date },
//     licenseImage: { type: String },
//     status: { type: String, default: "unverified" }
//   },
//   { _id: false }
// );
const DocumentSchema = new Schema(
  {
    exp_date: { type: Date },
    image: { type: String },
  }, { _id: false });

// const School = new Schema(
//   {
// registrationNo: { type: String },
// ladelineNo: { type: String },
// schoolImage: { type: String },
// schoolId: { type: Schema.Types.ObjectId, ref: 'schools' },
//   },
//   { _id: false }
// );

// const Surveyor = new Schema(
//   {
//     school: { type: Schema.Types.ObjectId, ref: "users" },
//     identity: { type: String },
//     identityImage: { type: String },
//   },
//   { _id: false }
// );

const Student = new Schema(
  {
    fatherName: { type: String },
    enrollmentNumber: { type: String },
    class: { type: String },
    rollNo: { type: String },
    idCardImage: { type: String },
    parentImage: { type: String },
    // section: { type: String },
    // emergency_number: { type: String },
  }, { _id: false }
);

const Driver = new Schema(
  {
    license: { type: String },
    licenseExpiryDate: { type: String }, //add this field
    aadharCard: { type: String },
    online: { type: Boolean, default: false },
  }, { _id: false }
);

const userSchema = new Schema(
  {
    name: { type: String },
    email: { type: String },
    mobile: { type: String },
    identity: { type: String },
    alternateMobile: { type: String },
    image: { type: String },
    password: { type: String },
    group: { type: Number },
    address: Address,
    location: Location,
    driverDetails: Driver,
    studentDetails: Student,
    otp: { type: Number },
    status: { type: Boolean, default: false },
    token: { type: String },
    school: { type: Schema.Types.ObjectId, ref: 'schools' },
    bus: { type: Schema.Types.ObjectId, ref: 'buses' },
    // route: [{ type: Schema.Types.ObjectId, ref: 'routes' }], //add this field
    isActive: { type: Boolean, default: true },
    isDelete: { type: Boolean, default: false },
    notificationTime: { type: String },
    // surveyorDetails: Surveyor,
  }, { timestamps: true }
);

module.exports = mongoose.model("users", userSchema);

// const user = mongoose.model("users", userSchema);
// module.exports = user;

