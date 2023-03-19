var ObjectID = require("mongoose").Types.ObjectId
const message = require("../../utils/message");
const response = require("../../utils/response");
const { findNotice, removeNotice, editNotice, showNotice, addNotice } = require('./dbQuery')


exports.createNotice = async function (req, res) {
    try {
        const isNotice = await findNotice({ description: req.body.description });
        if (!isNotice) {
            const data = await addNotice(req.body);
            if (data)
                return res.json(response.success(200, message.noticeBoard.NOTICE_CREATED, data));
            else
                return res.json(response.success(204, message.noticeBoard.FAILURE_NOTICE_CREATE));
        } else
            return res.json(response.success(204, message.noticeBoard.NOTICE_EXISTS));
    } catch (error) {
        console.log(error, 'error')
        return res.json(response.failure(204, message.noticeBoard.Catch_Error, error));
    }
}

exports.getNotice = async function (req, res) {
    try {
        let datd;
        if (req.user.group == 1)
            data = await showNotice({});
        else if (req.user.school)
            data = await showNotice({ school: ObjectID(req.user.school) });
        if (data.length)
            return res.json(response.success(200, message.noticeBoard.NOTICE_READ, data));
        else
            return res.json(response.success(204, message.serverResponseMessage.FAILURE_NOTICE_READ));

    } catch (error) {
        console.log(error, 'error')
        return res.json(response.failure(204, message.noticeBoard.Catch_Error, error));
    }
}

exports.updateNotice = async function (req, res,) {
    try {
        const isNotice = await findNotice({ _id: req.body.id });
        if (isNotice) {
            const data = await editNotice(req.body, isNotice);
            if (data)
                return res.json(response.success(200, message.noticeBoard.NOTICE_UPDATE, data));
            else
                return res.json(response.success(204, message.noticeBoard.FAILURE_NOTICE_UPDATE));
        } else
            return res.json(response.success(204, message.noticeBoard.NOTICE_DOES_NOT_EXISTS));
    } catch (error) {
        console.log(error, 'error')
        return res.json(response.failure(204, message.noticeBoard.Catch_Error, error));
    }
}

exports.deleteNotice = async function (req, res) {
    try {
        const isNotice = await findNotice({ _id: req.params.id });
        if (isNotice) {
            const data = await removeNotice(req);
            if (data)
                return res.json(response.success(200, message.noticeBoard.NOTICE_DELETE, data));
            else
                return res.json(response.success(204, message.noticeBoard.FAILURE_NOTICE_DELETE));
        } else
            return res.json(response.success(204, message.noticeBoard.NOTICE_DOES_NOT_EXISTS));
    } catch (error) {
        console.log(error, 'error')
        return res.json(response.failure(204, message.noticeBoard.Catch_Error, error));
    }
}

