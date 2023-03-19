var ObjectID = require("mongoose").Types.ObjectId
const message = require('../../utils/message');
const response = require('../../utils/response');
const Model = require("./schema");
const Route = require("../Route/schema");
const Location = require("../Location/schema");
const School = require("../User/schoolSchema");
const Users = require("../User/schema");
const moment = require("moment");
const momenttimezone = require('moment-timezone');
const { busStartNotification, setTimeNotification } = require("../Notification/controller");
const helperFunction = require("../../utils/helperFunction");
const { sendSos } = require("../../utils/helperFunction");

/* create trip by driver */
exports.create = async function (req, res) {
    try {
        const route = await Route.findById(req.body.route)
            .populate([
                // {
                //     path: "students",
                //     select: "_id name email mobile image address notificationTime"
                // },
                // {
                //     path: "driver",
                //     select: "_id name email mobile image location"
                // },
                {
                    path: "school",
                    select: "_id name email mobile logo location"
                },
                {
                    path: "surveyor",
                    select: "_id name email mobile image"
                },
                {
                    path: "bus",
                    select: "_id name bus_number bus_model driver",
                    populate: [{
                        path: "driver",
                        select: "_id name email mobile"
                    }]
                },
                {
                    path: "stops",
                    select: "_id name arrival departure students",
                    populate: [{
                        path: "students",
                        select: "_id name email mobile notificationTime studentDetails"
                    }]
                },
                // {
                //     path: "stops.students",
                //     select: "_id name"
                // },
            ])
            .lean(true);

        // const dateIndia = momenttimezone.tz(Date.now(), "Asia/Kolkata");
        // console.log(dateIndia);
        // console.log(new Date()); 
        const indiaDateTime = new Date().toLocaleString('en-US', { timeZone: 'Asia/Calcutta' });
        // const indiaDateTime = new Date().getTime()
        const trip = new Model({
            startTime: indiaDateTime, /* new Date() */
            school: route.school,
            surveyor: route.surveyor,
            driver: route.bus.driver,
            students: route.students,
            bus: route.bus,
            activities: [{ status: "Trip Started" }],
            status: "inProgress",
            type: route.type ? route.type : req.body.type,
            stops: route.stops,
            route: req.body.route,
            name: route.name + ', ' + route.type + ', ' + indiaDateTime,
        });
        const data = await trip.save();
        // const collectData = new Model(req.body);
        // const data = await createData(collectData);
        // if (data) {
        // await Route.updateOne({ _id: req.body.route }, { $set: { status: 'inProgress' } })
        busStartNotification(data.students) // send notification
        // }
        if (data) return res.json(response.success(200, message.bus.data_create_success, data));
        return res.json(response.failure(204, message.bus.data_create_error, error));
    } catch (error) {
        console.log(error, 'error')
        return res.json(response.failure(204, message.Catch_Error, error));
    }
}

exports.upcoming = async (req, res) => {
    try {
        // var date = moment(); // date all zone formate
        // var currentDate = date.format('D/MM/YYYY');
        // var currentDatew = date.format('D-MM-YYYY');
        // console.log(currentDate); // "17/06/2022"   
        // console.log(currentDatew); // "17-06-2022"   
        // let date = new Date;
        // let hours = date.getHours();
        // let minut = date.getMinutes();
        // let second = date.getSeconds();   
        // console.log(hours + ':' + minut + ':' + second)
        // var dd = date.getDate();
        // var mm = date.getUTCMonth();
        // var yy = date.getFullYear();
        // console.log(dd, mm, yy, day, date)
        // var currenDate = new Date();
        // if (req.query.forParentApp) {
        //     req.query["user"] = req.user._id;
        // }

        // query.push({
        //     $match: {
        //         days: {
        //             $in: [
        //                 date.format("ddd").toLowerCase()
        //                 // date.add(1, 'd').format('ddd').toLowerCase()
        //             ]
        //         },
        //         status: "published"
        //     }
        // });
        var date = new Date();
        var day = date.getDay();

        if (req.query.forDriverApp) {
            req.query["user"] = req.user._id;
        }
        // var date = moment();
        // if (req.query.date) {
        //     date = moment(new Date(req.query.date));
        //     console.log(date, 'date')
        // }
        let query = [];

        query.push({
            $match: {
                status: "published", isDelete: false
            }
        });
        // var currenDate = new Date(req.query.date);
        // if (req.query.date) {
        //     query.push({
        //         $match: {
        //             // days: { $in: [date.format("ddd").toLowerCase()] },
        //             // date: new Date(req.query.date),
        //             date: { $gte: currenDate },
        //         },
        //     });
        // };
        // if (req.query.date) {
        //     query.push(
        //         { $limit: 3 } /* only 3 days data show in 3 app */
        //     );
        // }
        // if (day == 7) { //upcoming trip not show sunday
        //     query.push({
        //         $match: { _id: ObjectID('63a95f9ba63aa455ed7b57e9') } /* sunday upcoming trip not show */
        //     });
        // }
        if (req.query._id) {
            query.push({
                $match: { _id: ObjectID(req.query._id) }
            });
        }
        // if (req.query.driver) { //not use
        //     console.log(req.query.driver)
        //     query.push({
        //         $match: { driver: ObjectID(req.query.driver) }
        //     });
        // }

        // if (req.query.student) { //not use
        //     query.push({
        //         $match: { students: ObjectID(req.query.student) }
        //     });
        // }
        if (req.query.forParentApp == "true") { // for student
            query.push({
                $match: {
                    students: ObjectID(req.query.student),
                }
            });
        }
        if (req.query.forDriverApp == "true") { // for driver
            query.push({
                $match: {
                    driver: ObjectID(req.query.user),
                }
            });
        }
        query.push(
            {
                $lookup: {
                    localField: "bus",
                    foreignField: "_id",
                    from: "buses",
                    as: "busInfo"
                }
            },
            {
                $unwind: { path: "$busInfo", preserveNullAndEmptyArrays: false } /* false means empty array data not show */
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
                    localField: "driver",
                    foreignField: "_id",
                    from: "users",
                    as: "driverInfo"
                }
            },
            {
                $unwind: { path: "$driverInfo", preserveNullAndEmptyArrays: false } /* true means empty array data show */
            },
            // {
            //     $lookup: {
            //         localField: "stops.students",
            //         foreignField: "_id",
            //         from: "users",
            //         as: "studentInfo"
            //     }
            // },
            // {
            //     $lookup: {
            //         localField: "_id",
            //         foreignField: "route",
            //         from: "trips",
            //         as: "tripInfo"
            //     }
            // },
            // {
            //     $addFields: {
            //         tripCount: {
            //             $size: ["$tripInfo"]
            //         }
            //     }
            // },
            // {
            //     $unwind: { path: "$tripInfo", preserveNullAndEmptyArrays: false } /* false means empty array data not show */
            // },
            // {
            //     $addFields: {
            //         studentCount: {
            //             $size: ["$students"]
            //         }
            //     }
            // },
            {
                $addFields: {
                    stopCount: {
                        $size: ["$stops"]
                    }
                }
            },
            { $sort: { _id: -1 } },
            // { working project not remove code from here
            //     $project: {
            //         _id: 1,
            //         student: "$student",
            //         // noOfStudents: { $first: "$students" },
            //         size: {
            //             $sum: ['$students']
            //         }
            //     }
            // },
            // {
            //     $group: {
            //         _id: "$_id",
            //         busNumber: { $first: "$busInfo.bus_number" },
            //         eta: { $first: "20" },
            //         // tripCount: { $first: "$tripCount" },
            //         //         noOfStudents: { $first: "$students" },
            //         //         size: {
            //         //             $sum: '$students'
            //         //         }
            //     }
            // },
        );

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

        var record = await Route.aggregate(query);

        var todayPickup = false;
        var todayDrop = false;
        record.forEach(async (element) => {
            let checkRouteIdInTrip = await Model.findOne({ route: element._id });
            if (checkRouteIdInTrip && checkRouteIdInTrip.type == "pickup" && checkRouteIdInTrip.createdAt.toString().substring(0, 15) == date.toString().substring(0, 15)) {
                todayPickup = true;
            }
            if (checkRouteIdInTrip && checkRouteIdInTrip.type == "drop" && checkRouteIdInTrip.createdAt.toString().substring(0, 15) == date.toString().substring(0, 15)) {
                todayDrop = true;
            }
        });
        var records = await Route.aggregate(query);

        return res.json(response.success(200, message.trip.data_get_success, records, { 'todayPickup': todayPickup, 'todayDrop': todayDrop }));
    } catch (error) {
        console.log(error)
        return res.json(response.failure(204, message.Catch_Error, error));
    }
};

exports.history = async (req, res) => {
    try {
        var query = [];
        const { search } = req.query;

        if (req.query._id) {
            query.push({
                $match: { _id: ObjectID(req.query._id) }
            });
        }
        if (req.user.group == 2) {
            query.push({
                $match: { "school._id": { $eq: ObjectID(req.user.school) } }
            });
        }
        if (req.query.school) {
            query.push({
                $match: { "school._id": { $eq: ObjectID(req.query.school) } }
            });
        }
        if (req.query.forParentApp) {
            delete req.query.forParentApp;
            query.push({
                $match: { students: { $eq: ObjectID(req.query.student) } }
                // $match: { "students._id": { $eq: ObjectID(req.query.student) } }
            });
        }
        if (req.query.forDriverApp) {
            delete req.query.forDriverApp;
            query.push({
                $match: { "driver._id": { $eq: ObjectID(req.user._id) } }
            });
        }
        if (req.query.date) {
            query.push({
                $match: {
                    // days: { $in: [date.format("ddd").toLowerCase()] },
                    startTime: new Date(req.query.date),
                }
            });
        }
        if (req.query.completed) {
            if (req.query.completed == "true") {
                delete req.query.completed;
                query.push({ //new added
                    $match: { completed: { $eq: true } }
                });
            } else if (req.query.completed == "false") {
                delete req.query.completed;
                query.push({ //new added
                    $match: { completed: { $eq: false } }
                });
            }
        }
        if (req.query.fromDate && req.query.toDate) {
            req.query.startTime = {
                $gte: new Date(req.query.fromDate),
                $lt: new Date(req.query.toDate)
            }
            delete req.query.fromDate;
            delete req.query.toDate;
        }
        query.push(
            {
                $lookup: {
                    localField: "bus._id",
                    foreignField: "_id",
                    from: "buses",
                    as: "busInfo"
                }
            },
            {
                $unwind: { path: "$busInfo", preserveNullAndEmptyArrays: false } /* false means empty array data not show */
            },
            {
                $lookup: {
                    localField: "driver._id",
                    foreignField: "_id",
                    from: "users",
                    as: "driverInfo"
                }
            },
            {
                $unwind: { path: "$driverInfo", preserveNullAndEmptyArrays: false } /* false means empty array data not show */
            },
            {
                $lookup: {
                    localField: "route",
                    foreignField: "_id",
                    from: "routes",
                    as: "routeInfo"
                }
            },
            {
                $unwind: { path: "$routeInfo", preserveNullAndEmptyArrays: false }
            },
            {
                $addFields: {
                    stopCount: {
                        $size: ["$routeInfo.stops"]
                    }
                }
            },
            {
                $addFields: {
                    studentCount: {
                        $size: ["$students"]
                    }
                }
            },
            { $sort: { _id: -1 } },
        )
        if (search) {
            query.push(
                {
                    '$match': {
                        '$or': [
                            {
                                'routeInfo.routeNo': { '$regex': new RegExp(search.toLowerCase().replace(/\s+/g, '\\s+'), 'gi') },
                            },
                            {
                                'busInfo.name': { '$regex': new RegExp(search.toLowerCase().replace(/\s+/g, '\\s+'), 'gi') },
                            },
                            {
                                'busInfo.bus_number': { '$regex': new RegExp(search.toLowerCase().replace(/\s+/g, '\\s+'), 'gi') },
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

        var records = await Model.aggregate(query)
        return res.json(response.success(200, message.trip.data_get_success, records));
    } catch (error) {
        console.log(error, 'error')
        return res.json(response.failure(204, message.Catch_Error, error));
    }
}

exports.complete = async (req, res) => {
    try {
        let query = { _id: req.params._id };
        const updatedRecord = await Model.findOneAndUpdate(query,
            { completed: true, status: "completed", endTime: new Date() },
            { new: true });

        if (!updatedRecord) return res.json(response.failure(204, message.trip.data_not_exist));
        if (updatedRecord) return res.json(response.success(200, message.trip.data_complete_success, updatedRecord));
        return res.json(response.failure(204, message.trip.data_complete_error));
        // if (updatedRecord) {
        //     let activityData = {
        //         _id: req.params._id,
        //         activity: { status: "Completed" }
        //     };
        //     addActivity(activityData, res);
        // } else {
        //     return res.json(response.failure(204, "trip not exist"));
        // }
    } catch (error) {
        console.log(error)
        return res.json(response.failure(204, message.Catch_Error, error));
    }
}

exports.distanceFunction = async (tripData, res) => { /*distance matrix function*/
    try {
        let link = '';
        tripData.stops.forEach(element => {
            // if (element.reached == false) {
            link += (element.lat + '%2C' + element.long + '%7C')
            // }
        });
        let locationData = await Location.findOne({ trip: tripData._id, driver: tripData.driver._id }).sort({ "_id": -1 }); /*find location by trip and driver id*/
        if (locationData) {
            // console.log(link, 'link')
            var axios = require('axios');
            var config = {
                method: 'get',
                url: `https://maps.googleapis.com/maps/api/distancematrix/json?key=AIzaSyA-xqOoKXoVGPxdXkTU_jKPPmL0LOXxrEM&origins=${locationData.lat}%2C${locationData.long}&destinations=${link}`,
                headers: {}
            };
            axios(config)
                .then(function (responseData) {
                    distanceDataUpdateFunction(responseData.data.rows[0].elements, tripData, locationData)
                })
                .catch(function (error) {
                    console.log(error);
                });
        }
    } catch (error) {
        console.log(error)
        return res.json(response.failure(204, message.Catch_Error, error));
    }
}

const distanceDataUpdateFunction = async (req, tripData, locationData, res) => { /*ETA and driver location update*/
    try {
        // tripData.driverLatestLocation = { lat: 1111111, long: locationData.long };
        tripData.driverLatestLocation.lat = locationData.lat;
        tripData.driverLatestLocation.long = locationData.long;

        for (let i = 0; i < tripData.stops.length; i++) {
            if (req[i].distance.value <= 100) {
                tripData.stops[i].reached = true
            }
            // console.log(req[i].duration, 'tripData tripData tripData tripData')
            setTimeNotification(tripData.stops[i], tripData, req[i].duration.value) // notification function

            tripData.stops[i].distance = req[i].distance.text;
            tripData.stops[i].duration = req[i].duration.text;
            // tripData.stops[i].durationValue = req[i].duration.value;
        }
        // console.log(tripData, 'tripData tripData tripData tripData')
        await tripData.save();

        // console.log(tripData, 'tripData tripData tripData tripData')
        // await Model.updateOne(
        //     { _id: tripData._id, "stops._id": tripData.stops[i].id },
        //     {
        //         $set: {
        //             "stops.$.reached": true, //"stops.$.index": i,
        //         }
        //     }, { new: true }
        // );

        // await Model.updateOne(
        //     { _id: tripData._id, "stops._id": tripData.stops[i].id },
        //     {
        //         $set: {
        //             "stops.$.distance": req[i].distance.text, "stops.$.duration": req[i].duration.text, driverLatestLocation: { lat: locationData.lat, long: locationData.long }
        //         }
        //     }, { new: true }
        // );
        // tripData.name = 'bubyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy';

        // delete tripData._id;
        // var trip = await Model.findOne({ _id: tripData._id });
    } catch (error) {
        console.log(error)
        return res.json(response.failure(204, message.Catch_Error, error));
    }
}

exports.sos = async (req, res) => {
    try {
        // const schoolData = await School.findOne({ _id: req.user.school });
        const schoolAdmin = await Users.find({ school: req.user.school, group: 2, isDelete: false });
        console.log(schoolAdmin)
        if (schoolAdmin) {
            schoolAdmin.forEach(element => {
                let sms = "Your bus driver start sos";
                sendSos({ phone: element.mobile }, sms, sms,
                    console.log("SOS sms sent successfully")
                );
            });
            return res.json(response.success(200, message.trip.sos_success));
        }
        return res.json(response.success(204, message.trip.sos_error));
    } catch (error) {
        console.log(error, 'error')
        return res.json(response.failure(204, message.Catch_Error, error));
    }
};

exports.getDriverLocation = async (req, res) => { //track driver live location
    try {
        let data = await Location.findOne({ trip: req.body.trip, driver: req.body.driver }).sort({ "_id": -1 });
        return res.json(response.success(200, message.trip.location_success, data));
    } catch (error) {
        console.log(error)
        return res.json(response.failure(204, message.Catch_Error, error));
    }
};


/* Start extra */
var distanceFunction = async (req, res) => {
    try {
        var axios = require('axios');
        var reqData = req.body;
        var config = {
            method: 'get',
            url: `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${reqData.origins.lat},${reqData.origins.long}&destinations=${reqData.destinations.lat},${reqData.destinations.long}&key=AIzaSyA-xqOoKXoVGPxdXkTU_jKPPmL0LOXxrEM&units=metric`,
            headers: {}
        };
        // url: 'https://maps.googleapis.com/maps/api/distancematrix/json?origins=Washington%2C%20DC&destinations=New%20York%20City%2C%20NY&units=imperial&key=AIzaSyA-xqOoKXoVGPxdXkTU_jKPPmL0LOXxrEM',
        axios(config)
            .then(function (responseData) {
                // console.log(JSON.stringify(responseData.data));
                return res.json(response.success(200, responseData.data))
            })
            .catch(function (error) {
                console.log(error);
            });
    } catch (error) {
        console.log(error)
        return res.json(response.failure(204, message.Catch_Error, error));
    }
}

exports.tracking = async (req, res) => { //track bus admin
    try {
        var query = [];
        const { search } = req.query;
        if (req.query._id) {
            query.push({
                $match: { _id: ObjectID(req.query._id) }
            });
        }
        if (req.query.school) {
            query.push({
                $match: { "school": ObjectID(req.query.school) }
            });
        }
        if (req.user.group == 2) {
            query.push({
                $match: { school: ObjectID(req.user.school) }
            });
        }
        query.push(
            {
                $match: {
                    status: "published"
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
                $unwind: { path: "$busInfo", preserveNullAndEmptyArrays: false } /* false means empty array data not show */
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
                $unwind: { path: "$driverInfo", preserveNullAndEmptyArrays: false } /* false means empty array data not show */
            },
            {
                $project: {
                    _id: 1,
                    school: '$school',
                    driverId: '$driverInfo._id',
                    busId: '$busInfo._id',
                    busNo: '$busInfo.bus_number',
                    busName: '$busInfo.name',
                    assignDriver: '$driverInfo.name',
                    routeNo: '$name',
                    status: '$status',
                }
            },
        );
        if (search) {
            query.push(
                {
                    '$match': {
                        '$or': [
                            {
                                busNo: { '$regex': new RegExp(search.toLowerCase().replace(/\s+/g, '\\s+'), 'gi') },
                            },
                            {
                                routeNo: { '$regex': new RegExp(search.toLowerCase().replace(/\s+/g, '\\s+'), 'gi') },
                            },
                            {
                                assignDriver: { '$regex': new RegExp(search.toLowerCase().replace(/\s+/g, '\\s+'), 'gi') },
                            },
                        ]
                    }
                },
            )
        }
        if (req.query.page && req.query.limit) {
            let limit = 10;
            const reqPage = Math.max(0, Number(req.query.page));
            if (Number(req.query.limit)) {
                limit = Number(req.query.limit);
            }
            const page = limit * reqPage;
            delete req.query.page;
            delete req.query.limit;
            query.push(
                { $sort: { _id: -1 } },
                { $skip: page },
                { $limit: limit }
            );
        }
        var records = await Route.aggregate(query);
        return res.json(response.success(200, message.trip.data_get_success, records));
    } catch (error) {
        console.log(error)
        return res.json(response.failure(204, message.Catch_Error, error));
    }
};

exports.location = async (req, res) => { //track bus location
    try {
        var query = [];
        if (req.query.bus) {
            query.push({
                $match: { "bus": ObjectID(req.query.bus) }
            });
        }
        query.push(
            { $sort: { _id: -1 } },
            { $limit: 1 },
        );
        var records = await Location.aggregate(query);
        return res.json(response.success(200, message.trip.location_get_for_trip, records));
    } catch (error) {
        console.log(error)
        return res.json(response.failure(204, message.Catch_Error, error));
    }
};

exports.distancee = async (req, res) => { //distance function for frontend
    try {
        const tripData = await Model.findById({ _id: req.body.tripid }); //findById
        let link = '';
        tripData.stops.forEach(element => {
            if (element.reached == false) {
                link += (element.lat + '%2C' + element.long + '%7C')
            }
        });
        // console.log(link, 'link')
        // return res.json(response.success(200, link))
        var axios = require('axios');
        var reqData = req.body;
        var config = {
            method: 'get',
            url: `https://maps.googleapis.com/maps/api/distancematrix/json?key=AIzaSyA-xqOoKXoVGPxdXkTU_jKPPmL0LOXxrEM&origins=${reqData.origins.lat}%2C${reqData.origins.long}&destinations=${link}`,
            headers: {}
        };// https://maps.googleapis.com/maps/api/distancematrix/json?origins=40.6655101%2C-73.89188969999998&destinations=40.659569%2C-73.933783%7C40.729029%2C-73.851524%7C40.6860072%2C-73.6334271%7C40.598566%2C-73.7527626&key=AIzaSyA-xqOoKXoVGPxdXkTU_jKPPmL0LOXxrEM
        // url: 'https://maps.googleapis.com/maps/api/distancematrix/json?origins=Washington%2C%20DC&destinations=New%20York%20City%2C%20NY&units=imperial&key=AIzaSyA-xqOoKXoVGPxdXkTU_jKPPmL0LOXxrEM',
        axios(config)
            .then(function (responseData) {
                // console.log(JSON.stringify(responseData.data));
                return res.json(response.success(200, responseData.data))
            })
            .catch(function (error) {
                console.log(error);
            });
    } catch (error) {
        console.log(error)
        return res.json(response.failure(204, message.Catch_Error, error));
    }
}
/* End extra */
