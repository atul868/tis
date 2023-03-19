var ObjectID = require("mongoose").Types.ObjectId
const message = require("../../utils/message");
const response = require("../../utils/response");
const Model = require("./schema");


module.exports.createHelp = async (req) => {
    const create = new Model({
        title: req.body.title,
        description: req.body.description,
    });
    return await create.save();
}

module.exports.getHelp = async (req) => {
    var helpData;
    if (req.query.id) {
        helpData = await Model.findById({ _id: ObjectID(req.query.id) })
    } else {
        helpData = await Model.aggregate([
            { $sort: { _id: -1 } },
        ])
    }
    return helpData;
}

module.exports.removeHelp = async (req) => {
    return await Model.findOneAndDelete({ _id: ObjectID(req.params._id) });
}


