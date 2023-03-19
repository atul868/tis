const { string } = require("joi");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// const Location = new Schema(
//   {
//     lat: { type: Number },
//     long: { type: Number },
//     accuracy: { type: Number }
//   },
//   { _id: false, timestamps: true }
// );

// const Address = new Schema(
//   {
//     lineOne: { type: String },
//     lineTwo: { type: String },
//     country: { type: String, default: "India" },
//     state: { type: String },
//     city: { type: String },
//     pincode: { type: Number, minlength: 6, maxlength: 6 },
//     locality: { type: String },
//     location: { type: Location }

//   },
//   { _id: false }
// );

const Stop = new Schema(
  {
    name: { type: String },
    arrival: { type: Date }, // need to replace with string
    departure: { type: Date },  // need to replace with string
    lat: { type: Number },
    long: { type: Number },
    accuracy: { type: Number },
    reached: { type: Boolean, default: false },
    surveyorReached: { type: Boolean, default: false },
    students: [{ type: Schema.Types.ObjectId, ref: 'users' }],
  }
);

const routeSchema = new Schema(
  {
    name: { type: String },
    // date: { type: Date },
    // surveyDate: { type: Date },
    // routeNo: { type: String },
    description: { type: String },
    school: { type: Schema.Types.ObjectId, ref: 'schools' },
    surveyor: { type: Schema.Types.ObjectId, ref: 'users' },
    bus: { type: Schema.Types.ObjectId, ref: 'buses' },
    driver: { type: Schema.Types.ObjectId, ref: 'users' },
    status: { type: String, default: 'created' },
    type: { type: String, enum: ['pickup', 'drop'] },
    // pickupTime: { type: Date },
    // dropTime: { type: Date },
    // startTime: { type: Date },
    // endTime: { type: Date },
    // days: [{ type: String, enum: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] }],
    // dayss: [{ type: Number, default: [1, 2, 3, 4, 5, 6], enum: [1, 2, 3, 4, 5, 6] }],
    stops: [Stop],
    students: [{ type: Schema.Types.ObjectId, ref: 'users' }],
    verifyRequest: { type: Boolean, default: false },
    isDelete: { type: Boolean, default: false },
  },
  { timestamps: true }
)


const route = mongoose.model("routes", routeSchema);

module.exports = route;

