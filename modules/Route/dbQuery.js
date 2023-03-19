var ObjectID = require("mongoose").Types.ObjectId
const Model = require("./schema");

module.exports.createData = async (data) => { 
    return await data.save();
}

module.exports.findData = async (data) => {
    return await Model.findOne(data);
}