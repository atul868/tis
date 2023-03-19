const { string } = require("joi");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const FeedbackSchema = new Schema(
    {
        type: { type: String, enum: ['feedback', 'absent', 'address'] },
        status: { type: String, enum: ['rejected', 'approved', 'pending'], default: 'pending' },
        student: { type: Schema.Types.ObjectId, ref: 'users' },
        school: { type: Schema.Types.ObjectId, ref: 'schools' },
        title: { type: String },
        description: { type: String },
        date: { type: Date },
        to: { type: Date },
        isActive: { type: Boolean, default: true },
        isDelete: { type: Boolean, default: false },
    },
    { timestamps: true }
);

const feedback = mongoose.model("feedback", FeedbackSchema);
module.exports = feedback;

