const { string } = require("joi");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CalendarSchema = new Schema(
    {
        student: { type: Schema.Types.ObjectId, ref: 'users' },
        route: { type: Schema.Types.ObjectId, ref: 'routes' },
        date: { type: Date },
        isDelete: { type: Boolean, default: false },
    },
    { timestamps: true }
);

const calendar = mongoose.model("calendar", CalendarSchema);
module.exports = calendar;

