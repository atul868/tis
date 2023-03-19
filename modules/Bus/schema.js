const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const DocumentSchema = new Schema(
    {
        exp_date: { type: String },
        image: { type: String },
    },
    { _id: false });

const busSchema = new Schema(
    {
        school: { type: Schema.Types.ObjectId, ref: 'schools' },
        route: { type: Schema.Types.ObjectId, ref: 'routes' },
        driver: { type: Schema.Types.ObjectId, ref: 'users' },
        name: { type: String }, // bus no
        bus_number: { type: String }, // vehical no
        bus_rc: { type: DocumentSchema, },
        bus_insurance: { type: DocumentSchema },
        tax: { type: DocumentSchema },
        fitness: { type: DocumentSchema },
        bus_pollution_crt: { type: DocumentSchema },
        isDelete: { type: Boolean, default: false },
    },
    { timestamps: true }
);

module.exports = mongoose.model("buses", busSchema);