const mongoose = require('mongoose');
const { Schema } = mongoose;

const Location = new Schema({
    lat: { type: Number, required: true },
    long: { type: Number, required: true },
    accuracy: { type: Number },
    trip: { type: Schema.Types.ObjectId, ref: 'trips' },
    school: { type: Schema.Types.ObjectId, ref: 'schools' },
    bus: { type: Schema.Types.ObjectId, ref: 'buses' },
    driver: { type: Schema.Types.ObjectId, ref: 'users' },
    student: { type: Schema.Types.ObjectId, ref: 'users' },
}, { timestamps: true }
)

module.exports = mongoose.model('locations', Location);