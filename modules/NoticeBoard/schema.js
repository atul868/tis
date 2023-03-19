const { string } = require("joi");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const noticeBoardSchema = new Schema(
    {
        school: { type: Schema.Types.ObjectId, ref: 'schools' },
        description: { type: String },
        date: { type: Date },
        title: { type: String },
        isActive: { type: Boolean, default: true }
    },
    { timestamps: true }
);

const noticeBoard = mongoose.model("noticeBoard", noticeBoardSchema);

module.exports = {
    noticeBoard
}
