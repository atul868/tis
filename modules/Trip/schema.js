const { string } = require("joi");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Elements = new Schema(
    {
        distance: { type: String },
        duration: { type: String },
    }
);

const Student = new Schema(
    {
        fatherName: { type: String },
        motherName: { type: String },
        class: { type: String },
        rollNo: { type: String },
        idCardImage: { type: String },
        parentImage: { type: String },
        // section: { type: String },
        // emergency_number: { type: String },
    }, { _id: false }
);

const Students = new Schema(
    {
        status: { type: Boolean, default: false },
        name: { type: String },
        email: { type: String },
        mobile: { type: String },
        notificationTime: { type: String },
        studentDetails: Student,
        notificationRecieve: { type: Boolean, default: false },
    }
);

const Stop = new Schema(
    {
        name: { type: String },
        arrival: { type: Date },
        departure: { type: Date },
        actualDeparture: { type: Date },
        actualDrrival: { type: Date },
        lat: { type: Number },
        long: { type: Number },
        accuracy: { type: Number },
        reached: { type: Boolean, default: false },
        students: [Students], //[{ type: Schema.Types.ObjectId, ref: 'users' }], { type: Schema.Types.Mixed },
        // elements: [Elements],
        distance: { type: String },
        duration: { type: String },
        durationValue: { type: Number },
        index: { type: String },
    }
);

const tripSchema = new Schema({
    name: { type: String },
    startTime: { type: Date },
    endTime: { type: Date },
    type: { type: String, enum: ['pickup', 'drop'] },
    completed: { type: Boolean, default: false },
    route: { type: Schema.Types.ObjectId, ref: 'routes' },
    driver: { type: Schema.Types.Mixed },
    bus: { type: Schema.Types.Mixed },
    school: { type: Schema.Types.Mixed },
    students: [{ type: Schema.Types.Mixed }],
    stops: [Stop],
    status: { type: String },
    driverLatestLocation: {
        lat: { type: Number },
        long: { type: Number }
    }
}, { timestamps: true })

const trip = mongoose.model("trips", tripSchema);
module.exports = trip;
