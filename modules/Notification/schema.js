const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const notificationSchema = new Schema(
    {
        // title: { type: String, },
        // body: { type: String, },
        student: { type: Schema.Types.ObjectId, ref: 'users' },
        trip: { type: Schema.Types.ObjectId, ref: 'trips' },
        // startDate: { type: Date, },
        // endDate: { type: Date },
        // image: { type: String },
        // users: { type: Array, default: [] },
        // topic: { type: String, default: 'general' },
        // propertyId: { type: Schema.Types.ObjectId, ref: 'property' },
        // brokerId: { type: Schema.Types.ObjectId, ref: 'brokers' },
        // isActive: { type: Boolean, default: true }
    }, { timestamps: true, }
);
module.exports = mongoose.model("notifications", notificationSchema);