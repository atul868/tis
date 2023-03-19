var ObjectID = require("mongoose").Types.ObjectId
const Model = require("./schema");

var round = require('mongo-round');


module.exports.findUser = async (data) => {
    return await Model.findOne(data);
}

module.exports.createResendOpt = async (data) => {
    return await data.save();
}
module.exports.checkPhoneExist = async (phoneExist) => {
    return await phoneExist.save();
}

module.exports.findAllStudent = async (data) => {
    return await Model.find(data);
}

module.exports.createUser = async (create) => {
    return await create.save();
}

module.exports.saveUser = async (data) => {
    return await data.save();
}
