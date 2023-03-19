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
        houseNo: { type: String },
        apartment: { type: String },
        lineOne: { type: String },
        lineTwo: { type: String },
        country: { type: String, default: "India" },
        state: { type: String },
        city: { type: String },
        pincode: { type: Number, minlength: 6, maxlength: 6 },
        locality: { type: String },
        // location: { type: Location },
    }, { _id: false }
);

const schoolSchema = new Schema(
    {
        name: { type: String },
        email: { type: String },
        mobile: { type: String, },
        registrationNo: { type: String },
        ladlineNo: { type: String },
        emergencyNo: { type: String },
        logo: { type: String },
        address: Address,
        location: Location, //[Location]
        gst: { type: String },
        isDelete: { type: Boolean, default: false },
    }, { timestamps: true }
);

module.exports = mongoose.model("schools", schoolSchema);

// const user = mongoose.model("users", userSchema);
// module.exports = user;

