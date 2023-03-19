const { ObjectId } = require('mongoose').Types;
const { noticeBoard } = require('./schema');

module.exports.findNotice = async (req) => {
    return await noticeBoard.findOne(req);
}

module.exports.addNotice = async (req) => {
    return await noticeBoard.create(req);
}

module.exports.showNotice = async (req) => {
    return await noticeBoard.find(req).lean();
}

module.exports.editNotice = async (req, noticeData) => {
    noticeData.school = req.school ? req.school : noticeData.school;
    noticeData.title = req.title ? req.title : noticeData.title;
    noticeData.description = req.description ? req.description : noticeData.description;
    noticeData.date = req.date ? req.date : noticeData.date;
    return await noticeData.save();
}

module.exports.removeNotice = async (req) => {
    return await noticeBoard.findByIdAndDelete({ _id: req.params.id });
}