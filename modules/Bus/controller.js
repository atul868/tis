var ObjectID = require("mongoose").Types.ObjectId;
const message = require('../../utils/message');
const response = require('../../utils/response');
const auth = require("../../utils/auth");
const Model = require("./schema");
const RouteDB = require("../Route/schema");
const TripDB = require("../Trip/schema");

const { createData, findData, updateData } = require('./dbQuery');

/* bus create */
exports.create = async function (req, res) {
    try {
        const checkbus = await Model.findOne({ bus_number: req.body.bus_number });
        if (checkbus) {
            return res.json(response.failure(204, message.bus.unique_bus_number));
        }

        const collectData = new Model(req.body);
        if (req.body.route) {
            const routeExist = await Model.findOne({ route: ObjectID(req.body.route) });
            if (routeExist) {
                await Model.updateOne({ route: ObjectID(routeExist.route) }, { $unset: { route: 1 } }, { new: true });
            }
        }
        if (req.body.driver) {
            const driverExist = await Model.findOne({ driver: ObjectID(req.body.driver) });
            if (driverExist) {
                await Model.updateOne({ driver: ObjectID(driverExist.driver) }, { $unset: { driver: 1 } }, { new: true });
            }
        }
        const data = await createData(collectData);
        if (data) return res.json(response.success(200, message.bus.data_create_success, data));
        return res.json(response.failure(204, message.bus.data_create_error, error));
    } catch (error) {
        console.log(error, 'error')
        return res.json(response.failure(204, message.Catch_Error, error));
    }
}

/* bus get and get by id */
exports.update = async function (req, res) {
    try {
        const checkbus = await Model.findOne({ bus_number: req.body.bus_number });
        if (checkbus && !(checkbus._id == req.params._id)) {
            return res.json(response.failure(204, message.bus.unique_bus_number));
        }

        const filter = req.params._id;
        const update = req.body;

        const busExist = await findData({ _id: filter });
        if (!busExist) {
            return res.json(response.failure(204, message.bus.data_not_exist));
        }
        if (req.body.route) {
            const routeExist = await Model.find({ route: ObjectID(req.body.route) });
            if (routeExist) {
                routeExist.forEach(async (element) => {
                    await Model.updateOne({ route: ObjectID(element.route) }, { $unset: { route: 1 } }, { new: true });
                });
            }
        }
        if (req.body.driver) {
            const driverExist = await Model.find({ driver: ObjectID(req.body.driver) });
            if (driverExist) {
                driverExist.forEach(async (element) => {
                    await Model.updateOne({ driver: ObjectID(element.driver) }, { $unset: { driver: 1 } }, { new: true });
                });
            }
        }
        const data = await updateData(filter, update);
        // var data = await Model.findByIdAndUpdate(filter, update, { new: true });

        if (data) return res.json(response.success(200, message.bus.data_update_success, data));
        return res.json(response.failure(204, message.bus.data_update_error));

    } catch (error) {
        console.log(error, 'error')
        return res.json(response.failure(204, message.Catch_Error, error));
    }
}

/* bus get and get by id */
exports.assignDriver = async function (req, res) {
    try {
        const filter = req.params._id;
        const update = req.body;

        const dataExist = await findData({ _id: filter });
        if (!dataExist) {
            return res.json(response.failure(204, message.bus.data_not_exist));
        }

        const findDriver = await Model.findOne({ driver: req.body.driver });
        if (findDriver) {
            return res.json(response.success(204, message.bus.driver_already_assigned));
        }

        var data = await Model.findByIdAndUpdate(filter, { $set: { driver: req.body.driver } }, { new: true });

        if (data) return res.json(response.success(200, message.bus.data_update_success, data));
        return res.json(response.failure(204, message.bus.data_update_error));

    } catch (error) {
        console.log(error, 'error')
        return res.json(response.failure(204, message.Catch_Error, error));
    }
}

/* bus edit or update */
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
        query.push({
            $match: { isDelete: false }
        },
            {
                $lookup: {
                    localField: "driver",
                    foreignField: "_id",
                    from: "users",
                    as: "driverInfo"
                }
            },
            {
                $lookup: {
                    localField: "_id",
                    foreignField: "bus",
                    from: "routes",
                    as: "routeInfo"
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
                                'routeInfo.routeNo': { '$regex': new RegExp(search.toLowerCase().replace(/\s+/g, '\\s+'), 'gi') },
                            },
                            {
                                'routeInfo.name': { '$regex': new RegExp(search.toLowerCase().replace(/\s+/g, '\\s+'), 'gi') },
                            },
                            {
                                'name': { '$regex': new RegExp(search.toLowerCase().replace(/\s+/g, '\\s+'), 'gi') },
                            },
                            {
                                'bus_number': { '$regex': new RegExp(search.toLowerCase().replace(/\s+/g, '\\s+'), 'gi') },
                            },
                            {
                                'driverInfo.name': { '$regex': new RegExp(search.toLowerCase().replace(/\s+/g, '\\s+'), 'gi') },
                            },
                        ]
                    }
                },
            )
        }
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
        //         { $sort: { _id: -1 } },
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
            if (data.length == 0) return res.json(response.failure(204, message.bus.data_not_exist));
            // else users = users[0];
        }
        return res.json(response.success(200, message.bus.data_get_success, data));
    } catch (error) {
        console.log(error, 'error')
        return res.json(response.failure(204, message.Catch_Error, error));
    }
}

/* bus delete */
exports.remove = async function (req, res) {
    try {
        const dataExist = await findData({ _id: req.params._id });
        if (!dataExist) {
            return res.json(response.failure(204, message.bus.data_not_exist));
        }

        const checkTrip = await TripDB.findOne({ 'bus._id': ObjectID(req.params._id), completed: false });
        if (!checkTrip) {
            await RouteDB.updateMany({ bus: req.params._id }, { $unset: { bus: 1 } }, { new: true });
            const data = await Model.updateOne({ _id: req.params._id }, { $set: { isDelete: true } }, { new: true });

            if (data) return res.json(response.success(200, message.bus.data_delete_success));
            return res.json(response.failure(204, message.bus.data_delete_error));
        }
        return res.json(response.failure(204, message.user.data_in_current_trip));

    } catch (error) {
        console.log(error, 'error')
        return res.json(response.failure(204, message.Catch_Error, error));
    }
}