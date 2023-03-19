const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const helpSchema = new Schema(
    {
        title: { type: String },
        description: { type: String },
        isActive: { type: Boolean, default: true },
        isDelete: { type: Boolean, default: false },
    },
    { timestamps: true, }
);

const help = mongoose.model("helps", helpSchema);
module.exports = help;