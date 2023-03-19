var ObjectID = require("mongoose").Types.ObjectId
const message = require("../../utils/message");
const response = require("../../utils/response");
const Model = require("./schema");

const { createHelp, getHelp, removeHelp } = require('./dbQuery');

/* create help center */
exports.create = async function (req, res) {
    try {
        if (!req.body.title && !req.body.description) {
            return res.json(response.success(200, message.help.data_needed));
        }
        const data = await createHelp(req);
        return res.json(response.success(200, message.help.data_create_success, data));
    } catch (error) {
        console.log(error, 'error')
        return res.json(response.failure(204, message.Catch_Error, error));
    }
};

/* edit help center */
exports.edit = async function (req, res) {
    try {
        const helpData = await Model.findOne({ _id: ObjectID(req.params._id) });
        if (!helpData) {
            return res.json(response.failure(204, message.help.data_not_exist));
        }
        helpData.title = req.body.title ? req.body.title : helpData.title;
        helpData.description = req.body.description ? req.body.description : helpData.description;
        helpData.save();
        return res.json(response.success(200, message.help.data_update_success, helpData));
    } catch (error) {
        console.log(error, 'error')
        return res.json(response.failure(204, message.Catch_Error, error));
    }
}

/* get help center */
exports.get = async function (req, res) {
    try {
        const helpData = await getHelp(req, res);
        return res.json(response.success(200, message.help.data_get_success, helpData));
    } catch (error) {
        console.log(error, 'error')
        return res.json(response.failure(204, message.Catch_Error, error));
    }
}

/* delete help center */
exports.remove = async function (req, res) {
    try {
        const helpData = await removeHelp(req);
        if (!helpData) {
            return res.json(response.failure(204, message.help.data_not_exist));
        }
        return res.json(response.success(200, message.help.data_delete_success));
    } catch (error) {
        console.log(error, 'error')
        return res.json(response.failure(204, message.Catch_Error, error));
    }
}