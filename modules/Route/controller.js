var ObjectID = require("mongoose").Types.ObjectId;
const message = require('../../utils/message');
const response = require('../../utils/response');
const auth = require("../../utils/auth");
const Model = require("./schema");
const UserDB = require("../User/schema");
const TripDB = require("../Trip/schema");
const Bus = require("../Bus/schema");
const SchoolDB = require("../User/schoolSchema");
const csvtojson = require('csvtojson')
const RouteDB = require("../Route/schema");

const XLSX = require("xlsx");
const path = require("path");

const { createData, findData } = require('./dbQuery');
const { date } = require("joi");
const { json } = require("express");
const { set } = require("mongoose");

/* Route create */
exports.create = async function (req, res) {
    try {
        req.body.school = req.user.school ? req.user.school : req.body.school;
        const collectData = new Model(req.body);
        const data = await createData(collectData);
        if (data) {
            const bus = await Bus.findOne({ _id: data.bus });
            if (bus) {
                await Model.updateOne({ _id: data._id }, { $set: { driver: bus.driver } }, { new: true });
            }
        }
        // let bus;
        // let data;
        // if (req.body.surveyor) {
        //     const checkAssignSurveyor = await Model.find({ surveyor: ObjectID(req.body.surveyor) });
        //     if (checkAssignSurveyor && req.body.force == "true") {
        //         checkAssignSurveyor.forEach(async (element) => {
        //             await Model.updateOne({ surveyor: ObjectID(element.surveyor) }, { $unset: { surveyor: 1 } }, { new: true });
        //         });

        //         const collectData = new Model(req.body);
        //         data = await createData(collectData);
        //         if (data) {
        //             bus = await Bus.findOne({ _id: data.bus });
        //             if (bus) {
        //                 await Model.updateOne({ _id: data._id }, { $set: { driver: bus.driver } }, { new: true });
        //             }
        //         }
        //     }
        //     else if (checkAssignSurveyor) {
        //         return res.json(response.failure(204, message.route.surveyor_already_assign));
        //     }

        // } else {
        //     const collectData = new Model(req.body);
        //     data = await createData(collectData);
        //     if (data) {
        //         bus = await Bus.findOne({ _id: data.bus });
        //         if (bus) {
        //             await Model.updateOne({ _id: data._id }, { $set: { driver: bus.driver } }, { new: true });
        //         }
        //     }
        // }

        return res.json(response.success(200, message.route.data_create_success, data));
    } catch (error) {
        console.log(error, 'error')
        return res.json(response.failure(204, message.Catch_Error, error));
    }
}

/* Route get and get by id */
exports.update = async function (req, res) {
    try {
        const filter = req.params._id;
        const update = req.body;

        const dataExist = await findData({ _id: filter });
        if (!dataExist) {
            return res.json(response.failure(204, message.route.data_not_exist));
        }
        if (req.body.bus) {
            var data = await Model.updateOne({ _id: filter }, { $set: { bus: req.body.bus } });

            if (data) {
                let bus = await Bus.findOne({ _id: req.body.bus });

                if (bus) {
                    let aaa = await Model.updateOne({ _id: filter }, { $set: { driver: bus.driver } }, { new: true });
                }
            }
        }
        if (req.body.surveyor) {
            // const checkAssignSurveyor = await Model.find({ surveyor: ObjectID(req.body.surveyor) });
            // if (checkAssignSurveyor && req.body.force == "true") {
            //     checkAssignSurveyor.forEach(async (element) => {
            //         await Model.updateOne({ surveyor: ObjectID(element.surveyor) }, { $unset: { surveyor: 1 } }, { new: true });
            //     });
            var data = await Model.updateOne({ _id: filter },
                { $set: { surveyor: req.body.surveyor } });
            // }
        }
        if (req.body.status == 'published') {
            var checkBusAndDriverAssign = await Model.findOne({ _id: filter });
            if (checkBusAndDriverAssign.driver && checkBusAndDriverAssign.bus) {
                var data = await Model.updateOne({ _id: filter }, { $set: { status: req.body.status } });
                return res.json(response.success(200, message.route.data_update_success, data));
            }
            return res.json(response.failure(204, message.bus.assigned_error));
        }
        if (req.body.verifyRequest) {
            var data = await Model.updateOne({ _id: filter },
                { $set: { verifyRequest: false, status: 'published' } });
        }
        if (req.body.name || req.body.routeNo || req.body.school || req.body.type || req.body.students || req.body.stops || req.body.bus) {
            if (dataExist.status == 'published') {
                if (dataExist.driver && dataExist.bus) {
                    var data = await Model.updateOne({ _id: filter }, { $set: { name: req.body.name, routeNo: req.body.routeNo, school: req.body.school, type: req.body.type, student: req.body.students, stops: req.body.stops } });
                    return res.json(response.success(200, message.route.data_update_success, data));
                }
                return res.json(response.failure(204, message.bus.assigned_error));
            }
            if (dataExist.status == 'published' && req.body.bus) {
                let bus = await Bus.findOne({ _id: req.body.bus });
                if (bus) {
                    let assignBus = await Model.updateOne({ _id: filter }, { $set: { driver: bus.driver } }, { new: true });
                    if (assignBus.driver && assignBus.bus) {
                        var data = await Model.updateOne({ _id: filter }, { $set: { name: req.body.name, routeNo: req.body.routeNo, school: req.body.school, type: req.body.type, student: req.body.students, stops: req.body.stops } }, { new: true });
                        return res.json(response.success(200, message.route.data_update_success, data));
                    }
                    return res.json(response.failure(204, message.bus.assigned_error));
                }
            }
            if (dataExist.status == 'pending' || dataExist.status == 'created') {
                var data = await Model.updateOne({ _id: filter }, { $set: { name: req.body.name, routeNo: req.body.routeNo, school: req.body.school, type: req.body.type, student: req.body.students, stops: req.body.stops } });
                return res.json(response.success(200, message.route.data_update_success, data));
            }
            // }
            // var data = await Model.updateOne({ _id: filter }, { $set: { name: req.body.name, routeNo: req.body.routeNo, school: req.body.school, type: req.body.type, student: req.body.students, stops: req.body.stops } });
            // if (data) {
            //     // let bus = await Bus.findOne({ _id: req.body.bus });
            //     // if (bus) {
            //     //     await Model.updateOne({ _id: filter }, { $set: { driver: bus.driver } }, { new: true });
            //     // }
            //     var checkBusAndDriverAssign = await Model.findOne({ _id: filter });
            //     if (checkBusAndDriverAssign.driver && checkBusAndDriverAssign.bus) {
            //         return res.json(response.success(200, message.route.data_update_success, data));
            //     } else {
            //         await Model.updateOne({ _id: filter }, { $set: { status: 'pending' } }, { new: true });
            //     }
            //     return res.json(response.failure(204, message.bus.assigned_error));
            // }
        }

        if (data) return res.json(response.success(200, message.route.data_update_success, data));
        return res.json(response.failure(204, message.route.data_update_error));
    } catch (error) {
        console.log(error, 'error')
        return res.json(response.failure(204, message.Catch_Error, error));
    }
}

/* Route edit or update */
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
        if (req.user.group == 3) {
            query.push({
                $match: { surveyor: ObjectID(req.user._id) }
            });
        }
        // let date = new Date;
        // var dd = date.getDate();
        // var mm = date.getDay();
        // var yy = date.getFullYear();
        // console.log(dd + '-' + mm + '-' + yy)
        var currenDate = new Date(req.query.date);
        if (req.query.date) {
            query.push({
                $match: {
                    date: { $gte: currenDate },
                },
            });
        }
        if (req.query.verifyRequest) {
            query.push({
                $match: { verifyRequest: true }
            });
        }

        if (search) {
            query.push(
                {
                    '$match': {
                        '$or': [
                            {
                                routeNo: { '$regex': new RegExp(search.toLowerCase().replace(/\s+/g, '\\s+'), 'gi') },
                            },
                            {
                                name: { '$regex': new RegExp(search.toLowerCase().replace(/\s+/g, '\\s+'), 'gi') },
                            },
                            {
                                status: { '$regex': new RegExp(search.toLowerCase().replace(/\s+/g, '\\s+'), 'gi') },
                            },
                        ]
                    }
                },
            )
        }

        query.push({
            $match: { isDelete: false },
        },
            {
                $lookup: {
                    localField: "school",
                    foreignField: "_id",
                    from: "schools",
                    as: "schoolInfo"
                }
            },
            {
                $unwind: { path: "$schoolInfo", preserveNullAndEmptyArrays: false } /* true means empty array data show */
            },
            {
                $lookup: {
                    localField: "_id",
                    foreignField: "route",
                    from: "trips",
                    as: "tripInfo"
                }
            },
            {
                $lookup: {
                    localField: "bus",
                    foreignField: "_id",
                    from: "buses",
                    as: "busInfo"
                }
            },
            {
                $unwind: { path: "$busInfo", preserveNullAndEmptyArrays: true } /* false means empty array data not show */
            },
            {
                $lookup: {
                    localField: "busInfo.driver",
                    foreignField: "_id",
                    from: "users",
                    as: "driverInfo"
                }
            },
            {
                $unwind: { path: "$driverInfo", preserveNullAndEmptyArrays: true } /* false means empty array data not show */
            },
            {
                $lookup: {
                    localField: "surveyor",
                    foreignField: "_id",
                    from: "users",
                    as: "surveyorInfo"
                }
            },
            {
                $unwind: { path: "$surveyorInfo", preserveNullAndEmptyArrays: true } /* false means empty array data not show */
            },
            {
                $addFields: {
                    tripCount: {
                        $size: ["$tripInfo"]
                    }
                }
            },
            {
                $unwind: { path: "$tripInfo", preserveNullAndEmptyArrays: true } /* false means empty array data not show */
            },
            {
                $addFields: {
                    studentCount: {
                        $size: ["$students"]
                    }
                }
            },
            {
                $addFields: {
                    StopCount: {
                        $size: ["$stops"]
                        // "$size": { "$ifNull": [ "$stops", [] ] }
                    }
                }
            },
            {
                $group: {
                    _id: "$_id",
                    name: { $first: "$name" },
                    date: { $first: "$date" },
                    routeNo: { $first: "$routeNo" },
                    pickupTime: { $first: "$pickupTime" },
                    dropTime: { $first: "$dropTime" },
                    type: { $first: "$type" },
                    verifyRequest: { $first: "$verifyRequest" },
                    schoolId: { $first: "$schoolInfo._id" },
                    schoolName: { $first: "$schoolInfo.name" },
                    schoolAddress: { $first: "$schoolInfo.address" },
                    studentCount: { $first: "$studentCount" },
                    StopCount: { $first: "$StopCount" },
                    tripCount: { $first: "$tripCount" },
                    busId: { $first: "$busInfo._id" },
                    busName: { $first: "$busInfo.name" },
                    busNumber: { $first: "$busInfo.bus_number" },
                    status: { $first: "$status" },
                    driverId: { $first: "$driverInfo._id" },
                    driverName: { $first: "$driverInfo.name" },
                    surveyorId: { $first: "$surveyorInfo._id" },
                    surveyorName: { $first: "$surveyorInfo.name" },
                    stops: { $first: "$stops" },
                }
            },
            { $sort: { _id: -1 } },
        );

        if (req.query.date) {
            query.push(
                { $limit: 3 } /* only 3 days data show in 3 app */
            );
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
            if (data.length == 0) return res.json(response.failure(204, message.route.data_not_exist));
            // else users = users[0];
        }
        return res.json(response.success(200, message.route.data_get_success, data));
    } catch (error) {
        console.log(error, 'error')
        return res.json(response.failure(204, message.Catch_Error, error));
    }
}

/* Route delete */
exports.remove = async function (req, res) {
    try {
        const dataExist = await findData({ _id: req.params._id });
        if (!dataExist) {
            return res.json(response.failure(204, message.route.data_not_exist));
        }

        const checkTrip = await TripDB.findOne({ route: ObjectID(req.params._id), completed: false });
        if (!checkTrip) {
            const data = await Model.updateOne({ _id: req.params._id }, { $set: { isDelete: true } }, { new: true });

            if (data) return res.json(response.success(200, message.route.data_delete_success));
            return res.json(response.failure(204, message.route.data_delete_error));
        }
        return res.json(response.failure(204, message.route.data_in_current_trip));

    } catch (error) {
        console.log(error, 'error')
        return res.json(response.failure(204, message.Catch_Error, error));
    }
}

/* Route get and get by id */
exports.stopUpdate = async function (req, res) {
    try {
        if (req.body.routeId) {
            var filter = req.body.routeId;
        } else {
            var filter = req.body.stopId;
        }

        if (req.body.routeId) {
            var dataExist = await findData({ _id: filter });
            if (!dataExist) {
                return res.json(response.failure(204, message.route.data_not_exist));
            }
        } else {
            var dataExist = await Model.findOne({ _id: req.body.route, "stops._id": { $in: [filter] } });
            if (!dataExist) {
                return res.json(response.failure(204, message.route.data_not_exist));
            }
        }

        if (req.body.routeId) {
            var data = await Model.findByIdAndUpdate(filter,
                { $push: { stops: req.body.stops } }, { new: true }
            );
        } else {
            var data = await Model.updateOne(
                { _id: req.body.route, "stops._id": filter },
                {
                    $set: {
                        "stops.$.name": req.body.name, "stops.$.arrival": req.body.arrival, "stops.$.departure": req.body.departure,
                        "stops.$.lat": req.body.lat, "stops.$.long": req.body.long, "stops.$.accuracy": req.body.accuracy,
                        "stops.$.students": req.body.students, "verifyRequest": true, "status": "pending", "stops.$.surveyorReached": true
                    }
                }, { new: true }
            );
        }

        if (data) return res.json(response.success(200, message.route.data_update_success, data));
        return res.json(response.failure(204, message.route.data_update_error));

    } catch (error) {
        console.log(error, 'error')
        return res.json(response.failure(204, message.Catch_Error, error));
    }
}

/* student import */
exports.importRoute = async function (req, res) {
    try {
        var workbook = XLSX.readFile(path.resolve(req.files.uploadfile[0].path));
        req.files.route = XLSX.utils.sheet_to_json(
            workbook.Sheets[workbook.SheetNames[0]]
        );
        let routeArr = [];

        // let changeTimeFormat = new Date("01-01-2017 " + singleRow.time + ":00").toLocaleString('en-US', { timeZone: 'Asia/Calcutta' }); // normal time 10:00
        // console.log(new Date(Math.round((req.files.route[i]["Time"] - 25569) * 86400 * 1000))); // excle sheet time 10:00
        for (var i = 0; i < req.files.route.length; i++) {
            var singleRow = {
                school: req.body.school,
                type: req.files.route[i]["Type"],
                routeName: req.files.route[i]["Route Name"],
                stopName: req.files.route[i]["Stop Name"],
                studentName: req.files.route[i]["Student Name"],
                studentNumber: req.files.route[i]["Parent Mobile No"],
                time: new Date(Math.round((req.files.route[i]["Time"] - 25569) * 86400 * 1000)),

                ParentName: req.files.route[i]['Parent Name'],
                Address: req.files.route[i]['Address'],
                EnrollmentNumber: req.files.route[i]['Enrollment Number'],
                AlternateMobile: req.files.route[i]['Alternate Number'],
                // surveyor: req.files.route[i]["Surveyor"],
                // bus: req.files.route[i]["Bus"],
            };

            if (!singleRow.type || !singleRow.routeName || !singleRow.stopName /*|| !singleRow.studentName || !singleRow.studentNumber*/ || !singleRow.time) {
                routeArr.push({
                    "Route Name": req.files.route[i]["Route Name"],
                    "Type": req.files.route[i]["Type"],
                    "Stop Name": req.files.route[i]["Stop Name"],
                    "Contact Number": req.files.route[i]["Contact Number"],
                    "Student Name": req.files.route[i]["Student Name"],
                    "Time": req.files.route[i]["Time"],
                    "message": "This entry not create in route",
                })
                continue;
            }
            if (!singleRow.studentName || !singleRow.studentNumber) {
                // continue ;
            }
            // let findSurveyor = await UserDB.findOne({ name: singleRow.surveyor, group: 3, school: req.body.school });
            // if (!findSurveyor) { continue }
            // let findBus = await Bus.findOne({ bus_number: singleRow.bus, school: req.body.school });
            // if (!findBus) { continue }

            let findExcelStudent = await UserDB.findOne({ mobile: singleRow.studentNumber, name: singleRow.studentName, school: req.body.school, group: 5 });
            if (!findExcelStudent) {//{ continue }
                findExcelStudent = await UserDB.create({
                    name: singleRow.studentName, mobile: singleRow.studentNumber, group: 5, school: req.body.school,
                    alternateMobile: singleRow.AlternateMobile, "studentDetails.enrollmentNumber": singleRow.EnrollmentNumber,
                    'address.lineOne': singleRow.Address, 'studentDetails.fatherName': singleRow.ParentName,
                });
            }

            if (findExcelStudent) {// recreate and update and restore delete student
                await UserDB.updateOne({ _id: findExcelStudent._id }, {
                    $set: {
                        name: singleRow.studentName, mobile: singleRow.studentNumber, group: 5, school: req.body.school,
                        alternateMobile: singleRow.AlternateMobile, "studentDetails.enrollmentNumber": singleRow.EnrollmentNumber,
                        'address.lineOne': singleRow.Address, 'studentDetails.fatherName': singleRow.ParentName, isDelete: false,
                    },
                }, { new: true });
            }

            let route = await Model.findOne({ school: req.body.school, name: singleRow.routeName, type: singleRow.type.toLowerCase() });
            if (!route) {
                route = await Model.create({
                    school: req.body.school, name: singleRow.routeName, type: singleRow.type.toLowerCase(), /* surveyor: findSurveyor._id,*/
                    /*bus: findBus._id, driver: findBus.driver,*/ /*type: req.body.type,*/ ///*uncomented*/  //stops: { name: singleRow.stopName, students: findExcelStudent._id },
                });
            }

            let checkStudentInOtherRoute = await Model.findOne({ 'stops.students': findExcelStudent._id ? findExcelStudent._id : '', type: singleRow.type.toLowerCase() });
            if (checkStudentInOtherRoute) {
                for (let i = 0; i < checkStudentInOtherRoute.stops.length; i++) {
                    await Model.updateOne({ 'stops.students': findExcelStudent._id },
                        { $pull: { 'students': findExcelStudent._id, 'stops.$.students': findExcelStudent._id } }, { new: true });
                }
            }

            let studentsArray = await Model.findOne({ _id: route, students: findExcelStudent._id }); /* route student array*/
            if (!studentsArray) {
                studentsArray = await Model.updateOne({ _id: route }, { $push: { students: findExcelStudent._id } });
            }

            let stop = await Model.findOne({ _id: route, 'stops.name': singleRow.stopName });
            if (!stop) {
                stop = await Model.updateOne({ _id: route }, { $push: { stops: { name: singleRow.stopName, arrival: singleRow.time, students: findExcelStudent._id } } });
            }

            let stopStudent = await Model.findOne({ _id: route, 'stops.name': singleRow.stopName, 'stops.students': { $in: [findExcelStudent._id] } });
            if (!stopStudent) {
                stopStudent = await Model.updateOne({ _id: route, 'stops.name': singleRow.stopName, /*'stops.students': { $in: [findExcelStudent._id] }*/ },
                    { $push: { 'stops.$.students': findExcelStudent._id } }, { new: true });
            }

            if (route) {
                route = await Model.updateOne({ _id: route, isDelete: true }, { $set: { isDelete: false } });
            }

            if (findExcelStudent.name == null) { /* delete extra student */
                await UserDB.findByIdAndDelete({ _id: findExcelStudent._id }, { new: true });
                await RouteDB.updateOne({ students: findExcelStudent._id }, { $pull: { students: findExcelStudent._id } }, { new: true });
                await RouteDB.updateOne({ 'stops.students': findExcelStudent._id }, { $pull: { 'stops.$[].students': findExcelStudent._id } }, { new: true });
            }

        }
        return res.json(response.success(200, message.route.import_success, {
            'err': routeArr, //'stop': routeArr
        }));
    } catch (error) {
        console.log(error, 'error')
        return res.json(response.failure(204, message.Catch_Error, error));
    }
}

exports.dashboard = async function (req, res) {
    try {
        let data = [];
        let student, driver, surveyor, schools, buses, currentTrip, completeTrip;

        if (req.query.school) {
            student = await UserDB.find({ school: ObjectID(req.query.school), group: 5, isDelete: false }).count()
            driver = await UserDB.find({ school: ObjectID(req.query.school), group: 4, isDelete: false }).count()
            surveyor = await UserDB.find({ school: ObjectID(req.query.school), group: 3, isDelete: false }).count()
            schools = await SchoolDB.find({ _id: ObjectID(req.query.school), isDelete: false }).count()
            buses = await Bus.find({ school: ObjectID(req.query.school), isDelete: false }).count()
            currentTrip = await TripDB.find({ school: ObjectID(req.query.school), complete: false }).count()
            completeTrip = await TripDB.find({ school: ObjectID(req.query.school), complete: true }).count()
        } else {
            student = await UserDB.find({ group: 5, isDelete: false }).count()
            driver = await UserDB.find({ group: 4, isDelete: false }).count()
            surveyor = await UserDB.find({ group: 3, isDelete: false }).count()
            schools = await SchoolDB.find({ isDelete: false }).count()
            buses = await Bus.find({ isDelete: false }).count()
            currentTrip = await TripDB.find({ complete: false }).count()
            completeTrip = await TripDB.find({ complete: true }).count()
        }

        data.push({
            'students': student,
            'drivers': driver,
            'surveyors': surveyor,
            'schools': schools,
            'buses': buses,
            'currentTrips': currentTrip,
            'completeTrips': completeTrip,
        })

        return res.json(response.success(200, message.route.data_get_success, data));
    } catch (error) {
        console.log(error, 'error')
        return res.json(response.failure(204, message.Catch_Error, error));
    }
}

/* admin dashboard for both admin */
// exports.dashboard = async function (req, res) {
//     try {
//         let data;
//         let query = [];
//         const { search } = req.query;

//         if (req.query.id) {
//             query.push({
//                 $match: { _id: ObjectID(req.query.id) }
//             });
//         }
//         // if (req.user.group == 2) {
//         //     query.push({
//         //         $match: { _id: ObjectID(req.user.school) }
//         //     });
//         // }
//         if (req.query.school) {
//             query.push({
//                 $match: { _id: ObjectID(req.query.school) }
//             });
//         }

//         if (search) {
//             query.push(
//                 {
//                     '$match': {
//                         '$or': [
//                             {
//                                 routeNo: { '$regex': new RegExp(search.toLowerCase().replace(/\s+/g, '\\s+'), 'gi') },
//                             },
//                             {
//                                 name: { '$regex': new RegExp(search.toLowerCase().replace(/\s+/g, '\\s+'), 'gi') },
//                             },
//                             {
//                                 status: { '$regex': new RegExp(search.toLowerCase().replace(/\s+/g, '\\s+'), 'gi') },
//                             },
//                         ]
//                     }
//                 },
//             )
//         }

//         query.push(
//             {
//                 $match: { isDelete: false },
//             },
//             {
//                 $lookup: {
//                     localField: "_id",
//                     foreignField: "school",
//                     from: "buses",
//                     as: "busInfo"
//                 }
//             },
//             {
//                 $addFields: {
//                     busCount: {
//                         $size: ["$busInfo"]
//                     }
//                 }
//             },
//             {
//                 $lookup: {
//                     localField: "_id",
//                     foreignField: "school",
//                     from: "routes",
//                     as: "routeInfo"
//                 }
//             },
//             {
//                 $addFields: {
//                     routeCount: {
//                         $size: ["$routeInfo"]
//                     }
//                 }
//             },
//             {
//                 $lookup: {
//                     localField: "_id",
//                     foreignField: "school._id",
//                     from: "trips",
//                     as: "tripInfo"
//                 }
//             },
//             {
//                 $addFields: {
//                     tripData: {
//                         $map: {
//                             input: {
//                                 $filter: {
//                                     input: "$tripInfo",
//                                     as: "tripRow",
//                                     cond: {
//                                         $eq: [
//                                             "$$tripRow.completed",
//                                             false,
//                                         ],
//                                     },
//                                 },
//                             },
//                             as: "tripData",
//                             in: {
//                                 rating: "$$tripData.name",
//                             },
//                         },
//                     },
//                 },
//             },
//             {
//                 $addFields: {
//                     tripCount: {
//                         $size: ["$tripData"]
//                     }
//                 }
//             },
//             {
//                 $lookup: {
//                     localField: "_id",
//                     foreignField: "school",
//                     from: "users",
//                     as: "studentInfo"
//                 }
//             },
//             {
//                 $addFields: {
//                     studentData: {
//                         $map: {
//                             input: {
//                                 $filter: {
//                                     input: "$studentInfo",
//                                     as: "studentRow",
//                                     cond: {
//                                         "$and": [{
//                                             $eq: [
//                                                 "$$studentRow.group",
//                                                 5,
//                                             ],
//                                         },
//                                         {
//                                             $eq: [
//                                                 "$$studentRow.isDelete",
//                                                 false,
//                                             ],
//                                         }],
//                                     },
//                                 },
//                             },
//                             as: "studentData",
//                             in: {
//                                 rating: "$$studentData.name",
//                             },
//                         },
//                     },
//                 },
//             },
//             {
//                 $addFields: {
//                     studentCount: {
//                         $size: ["$studentData"]
//                     }
//                 }
//             },
//             {
//                 $lookup: {
//                     localField: "_id",
//                     foreignField: "school",
//                     from: "users",
//                     as: "surveyorInfo"
//                 }
//             },
//             {
//                 $addFields: {
//                     surveyorData: {
//                         $map: {
//                             input: {
//                                 $filter: {
//                                     input: "$surveyorInfo",
//                                     as: "surveyorRow",
//                                     cond: {
//                                         "$and": [{
//                                             $eq: [
//                                                 "$$surveyorRow.group",
//                                                 3,
//                                             ],
//                                         },
//                                         {
//                                             $eq: [
//                                                 "$$surveyorRow.isDelete",
//                                                 false,
//                                             ],
//                                         }],
//                                     },
//                                 },
//                             },
//                             as: "surveyorData",
//                             in: {
//                                 rating: "$$surveyorData.name",
//                             },
//                         },
//                     },
//                 },
//             },
//             {
//                 $addFields: {
//                     surveyorCount: {
//                         $size: ["$surveyorData"]
//                     }
//                 }
//             },
//             // {
//             //     $addFields: {
//             //         StopCount: {
//             //             $size: ["$stops"]
//             //             // "$size": { "$ifNull": [ "$stops", [] ] }
//             //         }
//             //     }
//             // },
//             {
//                 $project: {
//                     _id: 1,
//                     busCount: '$busCount',
//                     routeCount: '$routeCount',
//                     tripCount: '$tripCount',
//                     studentCount: '$studentCount',
//                     surveyorCount: '$surveyorCount',

//                 }
//             },
//             { $sort: { _id: -1 } },
//         );

//         if (req.query.page && req.query.limit) {
//             let limit = 10;
//             const reqPage = Math.max(0, Number(req.query.page));
//             if (Number(req.query.limit)) {
//                 limit = Number(req.query.limit);
//             }
//             const page = limit * reqPage;
//             delete req.query.page;
//             delete req.query.limit;
//             query.push(
//                 { $skip: page },
//                 { $limit: limit }
//             );
//         }

//         data = await SchoolDB.aggregate(query);

//         if (req.query.id) {
//             if (data.length == 0) return res.json(response.failure(204, message.route.data_not_exist));
//             // else users = users[0];
//         }
//         return res.json(response.success(200, message.route.data_get_success, data));
//     } catch (error) {
//         console.log(error, 'error')
//         return res.json(response.failure(204, message.Catch_Error, error));
//     }
// }

