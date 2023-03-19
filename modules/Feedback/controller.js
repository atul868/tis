var ObjectID = require("mongoose").Types.ObjectId
const message = require("../../utils/message");
const response = require("../../utils/response");
const Model = require("./schema");
const CalendarDB = require("../Calendar/schema");
const UserDB = require("../User/schema");


exports.create = async function (req, res) {
    try {
        const schoolData = await UserDB.findOne(ObjectID(req.body.student));
        if (schoolData) {
            req.body.school = schoolData.school;
        }
        if (!req.body.title && !req.body.description) {
            return res.json(response.success(200, message.feedback.data_needed));
        }
        const collectData = new Model(req.body);
        const data = await collectData.save();
        return res.json(response.success(200, message.feedback.data_create_success, data));
    } catch (error) {
        console.log(error, 'error')
        return res.json(response.failure(204, message.Catch_Error, error));
    }
}

exports.get = async function (req, res) {
    try {
        let data;
        let query = [];
        const { search } = req.query;

        if (req.query.id) {
            query.push({
                $match: { _id: ObjectID(req.query.id) }
            });
        }
        if (req.user.group == 2) {
            query.push({
                $match: { school: ObjectID(req.user.school) }
            });
        }
        if (req.query.school) {
            query.push({
                $match: { school: ObjectID(req.query.school) }
            });
        }
        if (req.query.student) {
            query.push({
                $match: { student: ObjectID(req.query.student) }
            });
        }
        if (req.query.type) {
            query.push({
                $match: { type: req.query.type }
            });
        }

        query.push({
            $match: { isDelete: false },
        },
            {
                $lookup: {
                    localField: "student",
                    foreignField: "_id",
                    from: "users",
                    as: "studentInfo"
                }
            },
            { $sort: { _id: -1 } },
        );

        if (search) {
            query.push(
                {
                    '$match': {
                        '$or': [
                            {
                                'studentInfo.studentDetails.fatherName': { '$regex': new RegExp(search.toLowerCase().replace(/\s+/g, '\\s+'), 'gi') },
                            },
                        ]
                    }
                },
            )
        }

        var metaQuery = await Model.aggregate(query);

        // if (req.query.page && req.query.limit) {
        //     let limit = 10;
        //     const reqPage = Math.max(0, Number(req.query.page));
        //     if (Number(req.query.limit)) {
        //         limit = Number(req.query.limit);
        //     }
        //     const page = limit * reqPage;
        //     delete req.query.page;
        //     delete req.query.limit;
        //     query.push(
        //         { $skip: page },
        //         { $limit: limit }
        //     );
        // }
        const { page, limit } = req.query;
        var limitQuery = parseInt(limit, 10) || 10;
        const pageNoQuery = parseInt(page, 10) || 0;
        const skip = pageNoQuery * limitQuery;
        query.push(
            { $skip: skip },
            { $limit: limitQuery }
        );

        data = await Model.aggregate(query);

        if (req.query.id) {
            if (data.length == 0) return res.json(response.failure(204, message.feedback.data_not_exist));
            // else users = users[0];
        }
        return res.json(response.success(200, message.feedback.data_get_success, data, { 'total': metaQuery.length }));
    } catch (error) {
        console.log(error, 'error')
        return res.json(response.failure(204, message.Catch_Error, error));
    }
}

exports.update = async function (req, res,) {
    try {
        const feedback = await Model.findOne(ObjectID(req.query.id));
        if (!feedback) {
            return res.json(response.success(204, message.feedback.data_not_exist));
        }
        let data;
        if (req.query.status == 'approved' && feedback.type == 'address') {
            data = await Model.updateMany({ _id: ObjectID(req.query.id) }, { $set: { status: req.query.status } }, { new: true });
            await UserDB.updateOne({ _id: feedback.student }, { $set: { 'address.lineOne': feedback.description } }, { new: true });
            return res.json(response.success(200, message.feedback.data_approved_success, data));
        }

        if (req.query.status == 'rejected') {
            data = await Model.updateMany({ _id: ObjectID(req.query.id) }, { $set: { status: req.query.status } }, { new: true });
            return res.json(response.success(200, message.feedback.data_reject_success, data));
        }

        if (req.query.status == 'approved' && feedback.type == 'absent') {
            data = await Model.updateMany({ _id: ObjectID(req.query.id) }, { $set: { status: req.query.status } }, { new: true });
            /* date function between two dates */
            var getDaysArray = function (s, e) { for (var a = [], d = new Date(s); d <= new Date(e); d.setDate(d.getDate() + 1)) { a.push(new Date(d)); } return a; };
            var daylist = getDaysArray(new Date(feedback.date), new Date(feedback.to));
            daylist.map((v) => v.toISOString().slice(0, 10)).join("")
            daylist.forEach(async (a) => {
                await CalendarDB.create({ student: feedback.student, date: a });
                console.log(a)
            });
            return res.json(response.success(200, message.feedback.data_approved_success, data));
        }

    } catch (error) {
        console.log(error, 'error')
        return res.json(response.failure(204, message.Catch_Error.Catch_Error, error));
    }
}

exports.remove = async function (req, res) {
    try {
        const feedback = await Model.findOne({ _id: req.params.id });
        if (feedback) {
            const data = await Model.findByIdAndDelete({ _id: req.params.id });
            if (data)
                return res.json(response.success(200, message.feedback.data_delete_success, data));
            else
                return res.json(response.success(204, message.feedback.data_delete_error));
        } else
            return res.json(response.success(204, message.feedback.data_not_exist));
    } catch (error) {
        console.log(error, 'error')
        return res.json(response.failure(204, message.Catch_Error, error));
    }
}

exports.getLeaveStudent = async function (req, res) {
    try {
        // var a = "21:09";
        // var date = new Date("01-01-2017 " + a + ":00").toLocaleString('en-US', { timeZone: 'Asia/Calcutta' });

        let data;
        let query = [];

        if (req.query.id) {
            query.push({
                $match: { _id: ObjectID(req.query.id) }
            });
        }
        if (req.query.student) {
            query.push({
                $match: { student: ObjectID(req.query.student) }
            });
        }

        query.push(
            { $match: { date: { $gte: new Date() } } },
            { $sort: { date: 1 } },
            { $limit: 3 }
        );
        // if (req.query.fromDate && req.query.toDate) {
        //     req.query.date = {
        //         $gte: new Date(req.query.fromDate),
        //         $lt: new Date(req.query.toDate)
        //     }
        //     delete req.query.fromDate;
        //     delete req.query.toDate;
        // }

        const { page, limit } = req.query;
        var limitQuery = parseInt(limit, 10) || 10;
        const pageNoQuery = parseInt(page, 10) || 0;
        const skip = pageNoQuery * limitQuery;
        query.push(
            { $skip: skip },
            { $limit: limitQuery }
        );

        data = await CalendarDB.aggregate(query);

        if (req.query.id) {
            if (data.length == 0) return res.json(response.failure(204, message.feedback.data_not_exist));
        }
        return res.json(response.success(200, message.feedback.data_get_success, data));
    } catch (error) {
        console.log(error, 'error')
        return res.json(response.failure(204, message.Catch_Error, error));
    }
}