var ObjectID = require("mongoose").Types.ObjectId;
const bcrypt = require('bcrypt');
const csvtojson = require('csvtojson')
const message = require('../../utils/message');
const response = require('../../utils/response');
const auth = require("../../utils/auth");
const Model = require("./schema");
const schoolModel = require("./schoolSchema");
const { sendMobileOtp } = require("../../utils/helperFunction");
const { findById } = require("./schema");
const { handleAWSUpload } = require("../../utils/s3");
const lodash = require("lodash");
const Location = require("../Location/schema");
const RouteDB = require("../Route/schema");
const TripDB = require("../Trip/schema");
const BusDB = require("../Bus/schema");

const XLSX = require("xlsx");
const path = require("path");

/* require query function */
const { findUser, createUser, saveUser,
    checkPhoneExist, createResendOpt, findAllStudent } = require('./dbQuery');


/* image upload */
exports.files = async function (data, res) {
    try {
        for (let file of data.files) {
            file.path = await handleAWSUpload(file);
        }
        return res.json(response.success(200, message.user.file_upload__success, data));
    } catch (error) {
        console.log(error);
        return res.json(response.failure(204, message.Catch_Error, error));
    }
};

/* student import */
// exports.importStudent = async function (req, res) {
//     try {
//         if (req.file.mimetype == "text/csv") {
//             importFile('./uploads' + '/excelUploads/' + req.file.filename);
//             function importFile(filePath) {

//                 var arrayToInsert = [];
//                 csvtojson().fromFile(filePath).then(source => {

//                     for (var i = 0; i < source.length; i++) {
//                         var singleRow = {
//                             school: req.body.school,
//                             group: 5,
//                             name: source[i]["Name"],
//                             mobile: source[i]["Mobile"],
//                             "address.lineOne": source[i]["lineOne"],
//                             // "address.lineTwo": source[i]["LineTwo"],
//                             // "address.country": source[i]["Country"],
//                             // "address.state": source[i]["State"],
//                             // "address.city": source[i]["City"],
//                             // "address.locality": source[i]["Locality"],
//                             // "address.pincode": source[i]["Pincode"],
//                             // "location.lat": source[i]["Lat"],
//                             // "location.long": source[i]["Long"],
//                             // "location.accuracy": source[i]["Accuracy"],
//                             "studentDetails.fatherName": source[i]["FatherName"],
//                             "studentDetails.class": source[i]["Class"],
//                             // "studentDetails.section": source[i]["Section"],
//                             "studentDetails.rollNo": source[i]["RollNo"],
//                         };
//                         arrayToInsert.push(singleRow);
//                     }

//                     Model.insertMany(arrayToInsert, (err, result) => {
//                         if (err) return response.failure(204, message.user.import_error, err);
//                         return response.success(200, message.user.import_success);
//                     });
//                 });
//             }
//             return res.json(response.success(200, message.user.import_success));
//         }
//         return res.json(response.failure(204, message.user.import_extension));
//     } catch (error) {
//         console.log(error, 'error')
//         return res.json(response.failure(204, message.Catch_Error, error));
//     }
// }

exports.importStudent = async function (req, res) {
    try {
        var workbook = XLSX.readFile(path.resolve(req.files.uploadfile[0].path));
        req.files.students = XLSX.utils.sheet_to_json(
            workbook.Sheets[workbook.SheetNames[0]]
        );
        for (var i = 0; i < req.files.students.length; i++) {
            if (!req.files.students[i]['Student Name'] || !req.files.students[i]['Parent Mobile No'] || !req.files.students[i]['Parent Name'] || !req.files.students[i]['Address']) {
                return res.json(response.failure(204, { 'message': 'Student Name, Parent Mobile No, Parent Name and Address are mandatory' }));
            }

            var singleRow = {
                // RollNo: req.files.students[i]['RollNo'],
                // Class: req.files.students[i]['Class'],
                Name: req.files.students[i]['Student Name'].trim(),
                Mobile: req.files.students[i]['Parent Mobile No'].toString().trim(),
                ParentName: req.files.students[i]['Parent Name'].trim(),
                Address: req.files.students[i]['Address'].trim(),
                EnrollmentNumber: req.files.students[i]['Enrollment Number'],
                AlternateMobile: req.files.students[i]['Alternate Number'],
            };

            let findStudent = await Model.findOne({ name: singleRow.Name, mobile: singleRow.Mobile, school: req.body.school });
            if (!findStudent) {
                findStudent = await Model.create({
                    name: singleRow.Name, mobile: singleRow.Mobile, school: req.body.school, 'studentDetails.fatherName': singleRow.ParentName,
                    /*'studentDetails.rollNo': singleRow.RollNo, 'studentDetails.class': singleRow.Class,*/ 'address.lineOne': singleRow.Address, group: 5,
                    alternateMobile: singleRow.AlternateMobile, "studentDetails.enrollmentNumber": singleRow.EnrollmentNumber,
                });
            }
            if (findStudent) {
                findStudent = await Model.updateOne({ _id: findStudent._id }, {
                    $set: {
                        name: singleRow.Name, mobile: singleRow.Mobile, school: req.body.school, 'studentDetails.fatherName': singleRow.ParentName, isDelete: false,
                        /*'studentDetails.rollNo': singleRow.RollNo, 'studentDetails.class': singleRow.Class,*/ 'address.lineOne': singleRow.Address, group: 5,
                        alternateMobile: singleRow.AlternateMobile, "studentDetails.enrollmentNumber": singleRow.EnrollmentNumber,
                    }
                });
            }
        }
        return res.json(response.success(200, message.user.import_success));
    } catch (error) {
        console.log(error, 'error')
        return res.json(response.failure(204, message.Catch_Error, error));
    }
}

/* driver import */
exports.importDriver = async function (req, res) {
    try {
        if (req.file.mimetype == "text/csv") {
            importFile('./uploads' + '/excelUploads/' + req.file.filename);
            function importFile(filePath) {

                var arrayToInsert = [];
                csvtojson().fromFile(filePath).then(source => {

                    for (var i = 0; i < source.length; i++) {
                        var singleRow = {
                            school: req.body.school,
                            group: 4,
                            name: source[i]["Name"],
                            email: source[i]["Email"],
                            mobile: source[i]["Mobile"],
                            "driverDetails.dlNo": source[i]["DL.NO"],
                            "location.lat": source[i]["Lat"],
                            "location.long": source[i]["Long"],
                            "location.accuracy": source[i]["Accuracy"],
                        };
                        arrayToInsert.push(singleRow);
                    }

                    Model.insertMany(arrayToInsert, (err, result) => {
                        if (err) return response.failure(204, message.user.import_error, err);
                        return response.success(200, message.user.import_success);
                    });
                });
            }
            return res.json(response.success(200, message.user.import_success));
        }
        return res.json(response.failure(204, message.user.import_extension));
    } catch (error) {
        console.log(error, 'error')
        return res.json(response.failure(204, message.Catch_Error, error));
    }
}

/* admin and school login */
exports.login = async function (req, res) {
    try {
        const { email, password } = req.body;
        const userData = await Model.findOne({ email: email });
        if (!userData) return res.json(response.success(204, message.user.admin_not_exist));
        const result = await bcrypt.compare(password, userData.password);
        if (!result)
            return res.json(response.success(204, message.user.wrong_email_password));
        const token = auth.generateToken({ userId: userData._id });
        userData.authToken = token;
        const data = await userData.save();
        return res.json(response.success(200, message.user.admin_login_success, { token: token, _id: data._id, name: data.name, email: data.email, school: data.school, group: data.group }));
    } catch (error) {
        console.log(error, 'error')
        return res.json(response.failure(204, message.Catch_Error, error));
    }
}

/* otp login for surveyor, driver, student*/
exports.otpLogin = async function (req, res) {
    try {
        if (!req.body.type) {
            return res.json(response.failure(204, { message: "Please select app type first" }));
        }

        let checkMobile = req.body.mobile;
        let mobileValidation = checkMobile.toString().length;
        if (mobileValidation != 10) {
            return res.json(response.failure(204, message.user.mobile_number));
        }

        if (req.body.type == 'parent') {
            var phoneExist = await findUser({ mobile: req.body.mobile, group: 5, isDelete: false });
        }
        if (req.body.type == 'driver') {
            var phoneExist = await findUser({ mobile: req.body.mobile, group: 4, isDelete: false });
            console.log('driver')
        }
        if (req.body.type == 'surveyor') {
            var phoneExist = await findUser({ mobile: req.body.mobile, group: 3, isDelete: false });
            console.log('surveyor')
        }
        if (!phoneExist) {
            return res.json(response.failure(204, message.user.user_not_exist));
        }

        // var phoneExist = await findUser({ mobile: req.body.mobile });
        let otp = Math.floor(1000 + Math.random() * 9000);

        if (phoneExist) {
            phoneExist.otp = otp;
            sendMobileOtp({ phone: req.body.mobile }, otp, req.body.otpAutoFill,
                console.log("otp sent successfully")
            );
            await checkPhoneExist(phoneExist);
            return res.json(response.success(200, message.user.otp_send_success, { otp: otp, otpAutoFill: req.body.otpAutoFill }));
        }
        return res.json(response.success(204, message.user.user_not_exist));

        // const create = new Model({
        //     mobile: req.body.mobile,
        //     otp: otp,
        //     group: req.body.group,
        // });
        // sendMobileOtp({ phone: req.body.mobile }, otp,
        //     console.log("otp sent successfully")
        // );
        // const data = await createUser(create);
        // return res.json(response.success(200, message.user.register_success, { otp: otp }));

    } catch (error) {
        console.log(error, 'error')
        return res.json(response.failure(204, message.Catch_Error, error));
    }
};

/* verify otp */
exports.verifyOtp = async function (req, res) {
    try {
        if (!req.body.type) {
            return res.json(response.failure(204, { message: "Please select app type first" }));
        }
        if (req.body.type == 'parent') {
            var userData = await findUser({ mobile: req.body.mobile, group: 5, isDelete: false });
        }
        if (req.body.type == 'driver') {
            var userData = await findUser({ mobile: req.body.mobile, group: 4, isDelete: false });
        }
        if (req.body.type == 'surveyor') {
            var userData = await findUser({ mobile: req.body.mobile, group: 3, isDelete: false });
        }
        // var userData = await findUser({ mobile: req.body.mobile, isDelete: false });

        if (!userData) {
            console.log('mobile')
            return res.json(response.failure(204, message.user.user_not_exist));
        }

        if (userData.mobile == 7895210001 && req.body.otp == 7878) { //new add if condition for autofill otp
        }
        else if (userData.otp !== req.body.otp) {
            // console.log('otp')
            return res.json(response.failure(204, message.user.incorrect_otp));
        }
        const token = auth.generateToken({ userId: userData._id });

        userData.otp = "";
        userData.authToken = token;

        const allUserData = await saveUser(userData);
        // const data = await saveUser(userData);

        if (allUserData.group == 5 && req.body.type == 'parent') {
            var data = await findAllStudent({ mobile: req.body.mobile, group: 5, isDelete: false });
        }
        if (allUserData.group == 4 && req.body.type == 'driver') {
            var data = await findAllStudent({ mobile: req.body.mobile, group: 4, isDelete: false });
        }
        if (allUserData.group == 3 && req.body.type == 'surveyor') {
            var data = await findAllStudent({ mobile: req.body.mobile, group: 3, isDelete: false });
        }
        // var data = await findAllStudent({ mobile: req.body.mobile, isDelete: false });

        return res.json(response.success(200, message.user.login_success, { token, data }));
        // return res.json(response.success(200, message.user.login_success, { token, _id: data._id, mobile: data.mobile }));

    } catch (error) {
        console.log(error, 'error')
        return res.json(response.failure(204, message.Catch_Error, error));
    }
}

/* resend otp */
exports.resendOtp = async function (req, res) {
    try {
        if (!req.body.type) {
            return res.json(response.failure(204, { message: "Please select app type first" }));
        }

        let checkMobile = req.body.mobile;
        let mobileValidation = checkMobile.toString().length;
        if (mobileValidation != 10) {
            return res.json(response.failure(204, message.user.mobile_number));
        }

        // const userData = await findUser({ mobile: req.body.mobile });
        if (req.body.type == 'parent') {
            var userData = await findUser({ mobile: req.body.mobile, group: 5, isDelete: false });
        }
        if (req.body.type == 'driver') {
            var userData = await findUser({ mobile: req.body.mobile, group: 4, isDelete: false });
        }
        if (req.body.type == 'surveyor') {
            var userData = await findUser({ mobile: req.body.mobile, group: 3, isDelete: false });
        }
        if (!userData) {
            return res.json(response.failure(204, message.user.user_not_exist));
        }

        let otp = Math.floor(10000 + Math.random() * 90000);

        userData.otp = otp;

        sendMobileOtp(
            {
                phone: req.body.mobile,
            },
            otp,
            console.log("otp sent successfully")
        );
        await createResendOpt(userData);

        return res.json(response.success(200, message.user.otp_resend_success, { otp: otp }));

    } catch (error) {
        console.log(error, 'error')
        return res.json(response.failure(204, message.Catch_Error, error));
    }
}

/* school signup */
exports.school = async function (req, res) {
    try {
        const emailExist = await schoolModel.findOne({ email: req.body.email });
        if (emailExist) {
            return res.json(response.failure(204, message.user.school_email_exist));
        }
        const phoneExist = await schoolModel.findOne({ mobile: req.body.contactNo });
        if (phoneExist) {
            return res.json(response.failure(204, message.user.school_mobile_exist));
        }
        const adminEmailExist = await findUser({ email: req.body.email });
        if (adminEmailExist) {
            return res.json(response.failure(204, message.user.schooladmin_email_exist));
        }
        const adminPhoneExist = await findUser({ mobile: req.body.adminMobile });
        if (adminPhoneExist) {
            return res.json(response.failure(204, message.user.schooladmin_mobile_exist));
        }
        if (req.body.password) {
            req.body.password = await auth.hashPasswordUsingBcrypt(req.body.password);
        }
        const create = new schoolModel({
            name: req.body.name, mobile: req.body.contactNo, logo: req.body.logo, address: req.body.address
        });
        const data = await create.save();
        if (data) {
            let adminCreate = new Model({
                name: req.body.adminName, mobile: req.body.adminMobile, email: req.body.email, group: 2,
                password: req.body.password, school: data._id
            });
            await createUser(adminCreate);
        }
        return res.json(response.success(200, message.user.school_create_success, data));
    } catch (error) {
        console.log(error, 'error')
        return res.json(response.failure(204, message.Catch_Error, error));
    }
}

/* school signup */
exports.schoolAdmin = async function (req, res) {
    try {
        const emailExist = await findUser({ email: req.body.email });
        if (emailExist) {
            return res.json(response.failure(204, message.user.email_exist));
        }
        const phoneExist = await findUser({ mobile: req.body.adminMobile });
        console.log(phoneExist)
        if (phoneExist) {
            return res.json(response.failure(204, message.user.mobile_exist));
        }
        const schoolExist = await schoolModel.findById(req.body.school);
        if (!schoolExist) {
            return res.json(response.failure(204, message.user.school_not_exist));
        }
        if (req.body.password) {
            req.body.password = await auth.hashPasswordUsingBcrypt(req.body.password);
        }
        req.body.group = 2; // school admin
        const create = new Model({
            name: req.body.adminName, mobile: req.body.adminMobile, email: req.body.email, group: 2,
            password: req.body.password, school: req.body.school,
        });
        // await createUser(adminCreate);
        // const create = new Model(req.body);
        const data = await createUser(create);
        return res.json(response.success(200, message.user.data_create_success, data));
    } catch (error) {
        console.log(error, 'error')
        return res.json(response.failure(204, message.Catch_Error, error));
    }
}

/* school Edit or update */
exports.updateSchoolAdmin = async function (req, res) {
    try {
        // const checkMobile = await Model.findOne({ mobile: req.body.mobile, isDelete: false });
        // if (checkMobile && !(checkMobile._id == req.params._id)) {
        //     return res.json(response.failure(204, message.user.surveyor_mobile_exist));
        // }

        const checkAdminMobile = await Model.findOne({ mobile: req.body.adminMobile });
        if (checkAdminMobile && !(checkAdminMobile._id == req.params._id)) {
            return res.json(response.failure(204, message.user.schooladmin_mobile_exist));
        }
        const adminEmailExist = await findUser({ email: req.body.email });
        if (adminEmailExist && !(adminEmailExist._id == req.params._id)) {
            return res.json(response.failure(204, message.user.schooladmin_email_exist));
        }

        if (req.body.password) {
            req.body.password = await auth.hashPasswordUsingBcrypt(req.body.password);
        }
        const filter = req.params._id;
        const update = req.body;
        // const data = await Model.findByIdAndUpdate(filter, update, { new: true });
        // const data = await updateUser(filter, update);

        const data = await Model.findByIdAndUpdate(filter, {
            $set:
                { name: req.body.adminName, email: req.body.email, password: req.body.password, mobile: req.body.adminMobile }
        }, { new: true });
        if (data && data.group == 2) {
            return res.json(response.success(200, message.user.data_update_success, data));
        }
        return res.json(response.failure(204, message.user.data_update_error));
    } catch (error) {
        console.log(error, 'error')
        return res.json(response.failure(204, message.Catch_Error, error));
    }
}

/* school Edit or update */
exports.updateSchool = async function (req, res) {
    try {
        const filter = req.params._id;
        // const phoneExist = await schoolModel.findOne({ mobile: req.body.contactNo });
        // if (phoneExist) {
        //     return res.json(response.failure(204, message.user.school_mobile_exist));
        // }
        const adminEmailExist = await findUser({ email: req.body.email });
        if (adminEmailExist) {
            return res.json(response.failure(204, message.user.schooladmin_email_exist));
        }
        // const adminPhoneExist = await findUser({ mobile: req.body.adminMobile });
        // if (adminPhoneExist) {
        //     return res.json(response.failure(204, message.user.schooladmin_mobile_exist));
        // }
        const checkMobile = await schoolModel.findOne({ mobile: req.body.contactNo });
        if (checkMobile && !(checkMobile._id == req.params._id)) {
            return res.json(response.failure(204, message.user.school_mobile_exist));
        }
        const checkAdminMobile = await schoolModel.findOne({ mobile: req.body.adminMobile });
        if (checkAdminMobile && !(checkAdminMobile.school == req.params._id)) {
            return res.json(response.failure(204, message.user.schooladmin_mobile_exist));
        }

        if (req.body.password) {
            req.body.password = await auth.hashPasswordUsingBcrypt(req.body.password);
        }

        if (req.body.name || req.body.address || req.body.logo || req.body.contactNo) {
            var data = await schoolModel.findByIdAndUpdate(filter, {
                $set: {
                    name: req.body.name, address: req.body.address, logo: req.body.logo, mobile: req.body.contactNo
                }
            }, { new: true });
        }
        if (req.body.adminName || req.body.adminMobile || req.body.email || req.body.password) {
            await Model.findByIdAndUpdate(req.body.adminId, {
                $set: {
                    name: req.body.adminName, email: req.body.email, password: req.body.password, mobile: req.body.adminMobile
                }
            }, { new: true });
        }

        if (data) {
            return res.json(response.success(200, message.user.school_update_success, data));
        }
        return res.json(response.failure(204, message.user.school_update_error));
    } catch (error) {
        console.log(error, 'error')
        return res.json(response.failure(204, message.Catch_Error, error));
    }
}

/* get all School Admin or get single */
exports.getSchool = async function (req, res) {
    try {
        let users;
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
        query.push(
            {
                $match: { isDelete: false },
            },
            {
                $lookup: {
                    localField: "_id",
                    foreignField: "school",
                    from: "users",
                    as: "schoolAdminDetails"
                }
            },
            {
                $addFields: {
                    schoolAdminInfo: {
                        $map: {
                            input: {
                                $filter: {
                                    input: "$schoolAdminDetails",
                                    as: "schoolRow",
                                    cond: {
                                        "$and": [{
                                            $eq: [
                                                "$$schoolRow.group",
                                                2,
                                            ],
                                        },
                                        {
                                            $eq: [
                                                "$$schoolRow.isDelete",
                                                false,
                                            ],
                                        }],
                                    },
                                },
                            },
                            as: "schoolAdminInfo",
                            in: {
                                _id: "$$schoolAdminInfo._id",
                                name: "$$schoolAdminInfo.name",
                                email: "$$schoolAdminInfo.email",
                                mobile: "$$schoolAdminInfo.mobile",
                                school: "$$schoolAdminInfo.school",
                                group: "$$schoolAdminInfo.group",
                                isDelete: "$$schoolAdminInfo.isDelete",
                            },
                        },
                    },
                },
            },
            {
                $project: {
                    _id: 1,
                    name: '$name',
                    mobile: '$mobile',
                    address: '$address',
                    isDelete: '$isDelete',
                    schoolAdminInfo: '$schoolAdminInfo',
                }
            },
            { $sort: { _id: -1 } },
            // {
            //     "$addFields": {
            //         "schoolAdminInfo": {
            //             "$arrayElemAt": [
            //                 {
            //                     "$filter": {
            //                         "input": "$schoolAdminInfo",
            //                         "as": "school",
            //                         "cond": {
            //                             // $and: [
            //                             //     { "$eq": ["$$scl.group", 2] },
            //                             //     { "$eq": ["$$scl.isDelete", false] }
            //                             // ]
            //                             "$eq": ["$$school.group", 2]
            //                         }
            //                     }
            //                 }, 0
            //             ]
            //         }
            //     }
            // },
            // {
            //     $unwind: { path: "$schoolAdminInfo", preserveNullAndEmptyArrays: false } /* true means empty array data show */
            // },
        );
        if (search) {
            query.push(
                {
                    '$match': {
                        '$or': [
                            {
                                name: { '$regex': new RegExp(search.toLowerCase().replace(/\s+/g, '\\s+'), 'gi') },
                            },
                            {
                                mobile: { '$regex': new RegExp(search.toLowerCase().replace(/\s+/g, '\\s+'), 'gi') },
                            },
                            {
                                "address.lineOne": { '$regex': new RegExp(search.toLowerCase().replace(/\s+/g, '\\s+'), 'gi') },
                            },
                            {
                                "schoolAdminInfo.email": { '$regex': new RegExp(search.toLowerCase().replace(/\s+/g, '\\s+'), 'gi') },
                            },
                        ]
                    }
                },
            )
        }
        metaQuery = await schoolModel.aggregate(query);

        // if (req.query.page && req.query.limit) {
        //     let limit = 10;
        //     const reqPage = Math.max(0, Number(req.query.page));
        //     if (Number(req.query.limit)) {
        //         limit = Number(req.query.limit);
        //     }
        //     const page = limit * reqPage;
        //     // const page = Number(req.query.page);
        //     // const limit = Number(req.query.limit);
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

        users = await schoolModel.aggregate(query);

        if (req.query.id) {
            if (users.length == 0) return res.json(response.failure(204, message.user.school_not_exist));
            // else users = users[0];
        }

        return res.json(response.success(200, message.user.school_get_success, users, { 'total': metaQuery.length }));
    } catch (error) {
        console.log(error, 'error')
        return res.json(response.failure(204, message.Catch_Error, error));
    }
}

/* get all School Admin or get single */
exports.getSchoolAdmin = async function (req, res) {
    try {
        let users;
        let query = [];

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
        query.push(
            { $match: { isDelete: false, group: 2 } },
            {
                $lookup: {
                    localField: "school",
                    foreignField: "_id",
                    from: "schools",
                    as: "schoolDetails"
                }
            },
            { $sort: { _id: -1 } },
        );

        const { page, limit } = req.query;
        var limitQuery = parseInt(limit, 10) || 10;
        const pageNoQuery = parseInt(page, 10) || 0;
        const skip = pageNoQuery * limitQuery;
        query.push(
            { $skip: skip },
            { $limit: limitQuery }
        );

        users = await Model.aggregate(query);

        if (req.query.id) {
            if (users.length == 0) return res.json(response.failure(204, "user not exist"));
            // else users = users[0];
        }

        return res.json(response.success(200, message.user.data_get_success, users));
    } catch (error) {
        console.log(error, 'error')
        return res.json(response.failure(204, message.Catch_Error, error));
    }
}

/* school delete */
// exports.removeSchool = async function (req, res) {
//     try {
//         const dataExist = await schoolModel.findOne({ _id: req.params._id });
//         if (!dataExist) {
//             return res.json(response.failure(204, message.user.user_not_exist));
//         }
//         const checkTrip = await TripDB.findOne({ 'school._id': ObjectID(req.params._id), completed: false });
//         if (!checkTrip) {
//             await BusDB.updateMany({ school: req.params._id }, { $unset: { school: 1 } }, { new: true });
//             await Model.updateMany({ school: req.params._id }, { $unset: { school: 1 } }, { new: true });
//             await RouteDB.updateMany({ school: req.params._id }, { $unset: { school: 1 } }, { new: true });
//             const data = await schoolModel.updateOne({ _id: req.params._id }, { $set: { isDelete: true } }, { new: true });

//             if (data) return res.json(response.success(200, message.user.data_delete_success));
//             return res.json(response.failure(204, message.user.data_delete_error));
//         }
//         return res.json(response.failure(204, message.user.data_in_current_trip));
//     } catch (error) {
//         console.log(error, 'error')
//         return res.json(response.failure(204, message.Catch_Error, error));
//     }
// }

/* surveyor signup */
exports.surveyor = async function (req, res) {
    try {
        const phoneExist = await findUser({ mobile: req.body.mobile, isDelete: false, group: 4 });
        if (phoneExist) {
            return res.json(response.failure(204, message.user.surveyor_mobile_exist));
        }
        let data;
        let create;

        if (req.body.school) {
            const checkAssignSchool = await Model.find({ school: ObjectID(req.body.school), group: 3 });
            if (checkAssignSchool && req.body.force == "true") {
                checkAssignSchool.forEach(async (element) => {
                    await Model.updateOne({ school: ObjectID(element.school) }, { $unset: { school: 1 } }, { new: true });
                });
                req.body.group = 3;
                create = new Model(req.body);
                data = await createUser(create);
            }
            else if (checkAssignSchool) {
                return res.json(response.failure(204, message.user.school_already_assign_surveyor));
            }

        } else {
            req.body.group = 3;
            create = new Model(req.body);
            data = await createUser(create);
        }

        return res.json(response.success(200, message.user.data_create_success, data));
    } catch (error) {
        console.log(error, 'error')
        return res.json(response.failure(204, message.Catch_Error, error));
    }
}

/* surveyor Edit or update */
exports.updateSurveyor = async function (req, res) {
    try {
        const filter = req.params._id;
        let data;

        const checkMobile = await Model.findOne({ mobile: req.body.mobile, isDelete: false });
        if (checkMobile && !(checkMobile._id == req.params._id)) {
            return res.json(response.failure(204, message.user.surveyor_mobile_exist));
        }
        // if (req.body.name || req.body.school) {
        //     data = await Model.findByIdAndUpdate(filter, {
        //         $set: { name: req.body.name, school: req.body.school },
        //     }, { new: true });
        // }
        if (req.body.school) {
            const checkAssignSchool = await Model.find({ school: ObjectID(req.body.school), group: 3 });
            if (checkAssignSchool && req.body.force == "true") {
                checkAssignSchool.forEach(async (element) => {
                    let aaa = await Model.updateOne({ _id: filter, school: ObjectID(element.school) }, { $unset: { school: 1 } }, { new: true });
                });
                data = await Model.findByIdAndUpdate(filter, {
                    $set: { name: req.body.name, school: req.body.school, mobile: req.body.mobile },
                }, { new: true });
            }
            else if (checkAssignSchool) {
                return res.json(response.failure(204, message.user.school_already_assign_surveyor));
            }
        } else {
            data = await Model.findByIdAndUpdate(filter, {
                $set: { name: req.body.name, mobile: req.body.mobile },
            }, { new: true });
        }
        // // if (req.body.route) {
        // //     data = await Model.findByIdAndUpdate(filter, {
        // //         $push: { route: req.body.route }
        // //     }, { new: true });
        // // }
        if (data /*&& data.group == 3*/) {
            return res.json(response.success(200, message.user.surveyor_update_success, data));
        }
        return res.json(response.failure(204, message.user.surveyor_update_error));
    } catch (error) {
        console.log(error, 'error')
        return res.json(response.failure(204, message.Catch_Error, error));
    }
}

/* get all surveyor or get single */
exports.getSurveyor = async function (req, res) {
    try {
        let users;
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
                $match: { _id: ObjectID(req.user._id) }
            });
        }

        query.push(
            { $match: { isDelete: false, group: 3 } },
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
                    localField: "_id",
                    foreignField: "surveyor",
                    from: "routes",
                    as: "routeInfo"
                }
            },
            { $sort: { _id: -1 } },
            // {
            //     $unwind: { path: "$routeInfo", preserveNullAndEmptyArrays: true } /* false means empty array data not show */
            // },
        );

        if (search) {
            query.push(
                {
                    '$match': {
                        '$or': [
                            {
                                name: { '$regex': new RegExp(search.toLowerCase().replace(/\s+/g, '\\s+'), 'gi') },
                            },
                            {
                                identity: { '$regex': new RegExp(search.toLowerCase().replace(/\s+/g, '\\s+'), 'gi') },
                            },
                            {
                                mobile: { '$regex': new RegExp(search.toLowerCase().replace(/\s+/g, '\\s+'), 'gi') },
                            },
                        ]
                    }
                },
            )
        }

        // if (req.query.page && req.query.limit || !req.query.page && !req.query.limit) {
        //     let limit = 10;
        //     const reqPage = Math.max(0, Number(req.query.page));
        //     if (Number(req.query.limit)) {
        //         limit = Number(req.query.limit);
        //     }
        //     const page = limit * reqPage;
        //     // const page = Number(req.query.page);
        //     // const limit = Number(req.query.limit);
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

        users = await Model.aggregate(query);

        if (req.query.id) {
            if (users.length == 0) return res.json(response.failure(204, message.user.surveyor_not_exist));
            // else users = users[0];
        }

        return res.json(response.success(200, message.user.surveyor_get_success, users));
    } catch (error) {
        console.log(error, 'error')
        return res.json(response.failure(204, message.Catch_Error, error));
    }
}

/* driver signup */
exports.driver = async function (req, res) {
    try {
        const phoneExist = await findUser({ mobile: req.body.mobile, isDelete: false, group: 4 });
        if (phoneExist) {
            return res.json(response.failure(204, message.user.driver_mobile_exist));
        }
        if (req.body.password) {
            req.body.password = await auth.hashPasswordUsingBcrypt(req.body.password);
        }

        req.body.group = 4;
        const create = new Model(req.body);
        const data = await createUser(create);

        return res.json(response.success(200, message.user.driver_create_success, data));
    } catch (error) {
        console.log(error, 'error')
        return res.json(response.failure(204, message.Catch_Error, error));
    }
}

/* driver Edit or update */
exports.updateDriver = async function (req, res) {
    try {
        if (req.body.password) {
            req.body.password = await auth.hashPasswordUsingBcrypt(req.body.password);
        }

        const checkMobile = await Model.findOne({ mobile: req.body.mobile, isDelete: false });
        if (checkMobile && !(checkMobile._id == req.params._id)) {
            return res.json(response.failure(204, message.user.driver_mobile_exist));
        }

        const filter = req.params._id;
        const update = req.body;
        // const data = await Model.findByIdAndUpdate(filter, update, { new: true });
        const data = await Model.findByIdAndUpdate(filter,
            {
                $set: {
                    name: req.body.name, "driverDetails.license": req.body.license, "driverDetails.aadharCard": req.body.aadharCard, "driverDetails.licenseExpiryDate": req.body.licenseExpiryDate,
                    "location.lat": req.body.lat, "location.long": req.body.long, "location.accuracy": req.body.accuracy,
                    "address.lineOne": req.body.lineOne, "address.country": req.body.country, "address.state": req.body.state, "address.city": req.body.city, phone: req.body.phone,
                }
            }, { new: true }
        );

        if (data && data.group == 4) {
            return res.json(response.success(200, message.user.driver_update_success, data));
        }
        return res.json(response.failure(204, message.user.driver_update_error));

    } catch (error) {
        console.log(error, 'error')
        return res.json(response.failure(204, message.Catch_Error, error));
    }
}

/* get all driver or get single */
exports.getDriver = async function (req, res) {
    try {
        let users;
        let query = [];
        const { search } = req.query;

        if (req.query.id) {
            query.push({
                $match: { _id: ObjectID(req.query.id) }
            });
        }
        if (req.user.group == 4) {
            query.push({
                $match: { _id: ObjectID(req.user._id) }
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
        if (search) {
            query.push(
                {
                    '$match': {
                        '$or': [
                            {
                                mobile: { '$regex': new RegExp(search.toLowerCase().replace(/\s+/g, '\\s+'), 'gi') },
                            },
                            {
                                name: { '$regex': new RegExp(search.toLowerCase().replace(/\s+/g, '\\s+'), 'gi') },
                            },
                        ]
                    }
                },
            )
        }

        query.push(
            { $match: { isDelete: false, group: 4 } },
            {
                $lookup: {
                    localField: "_id",
                    foreignField: "driver",
                    from: "buses",
                    as: "busInfo"
                }
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
                $lookup: {
                    localField: "busInfo._id",
                    foreignField: "bus",
                    from: "routes",
                    as: "routeInfo"
                }
            },
            { $sort: { _id: -1 } },
        );

        // if (req.query.page && req.query.limit) {
        //     let limit = 10;
        //     const reqPage = Math.max(0, Number(req.query.page));
        //     if (Number(req.query.limit)) {
        //         limit = Number(req.query.limit);
        //     }
        //     const page = limit * reqPage;
        //     // const page = Number(req.query.page);
        //     // const limit = Number(req.query.limit);
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

        users = await Model.aggregate(query);

        if (req.query.id) {
            if (users.length == 0) return res.json(response.failure(204, message.user.driver_get_success));
            // else users = users[0];
        }

        return res.json(response.success(200, message.user.driver_get_success, users));
    } catch (error) {
        console.log(error, 'error')
        return res.json(response.failure(204, message.Catch_Error, error));
    }
}

/* student signup */
exports.student = async function (req, res) {
    try {
        // const emailExist = await findUser({ email: req.body.email });
        // if (emailExist) {
        //     return res.json(response.failure(204, message.user.email_exist));
        // }
        // const phoneExist = await findUser({ mobile: req.body.mobile });
        // if (phoneExist) {
        //     return res.json(response.failure(204, message.user.mobile_exist));
        // }
        // if (req.body.password) {
        //     req.body.password = await auth.hashPasswordUsingBcrypt(req.body.password);
        // }
        req.body.group = 5;
        const create = new Model(req.body);
        const data = await createUser(create);
        return res.json(response.success(200, message.user.student_create_success, data));
    } catch (error) {
        console.log(error, 'error')
        return res.json(response.failure(204, message.Catch_Error, error));
    }
}

/* student Edit or update */
exports.updateStudent = async function (req, res) {
    try {
        if (req.body.password) {
            req.body.password = await auth.hashPasswordUsingBcrypt(req.body.password);
        }
        const filter = req.params._id;
        const update = req.body;
        // const data = await Model.findByIdAndUpdate(filter, update, { new: true });
        // const data = await updateUser(filter, update);
        const data = await Model.findByIdAndUpdate(filter,
            {
                $set: {
                    name: req.body.name, "studentDetails.class": req.body.class, mobile: req.body.mobile, notificationTime: req.body.notificationTime,
                    "studentDetails.rollNo": req.body.rollNo, "studentDetails.fatherName": req.body.fatherName, "address.lineOne": req.body.address,
                    image: req.body.image, alternateMobile: req.body.alternateMobile, "studentDetails.enrollmentNumber": req.body.enrollmentNumber,
                }
            }, { new: true }
        );

        if (data /*&& data.group == 5*/) {
            return res.json(response.success(200, message.user.student_update_success, data));
        }
        return res.json(response.failure(204, message.user.student_update_error));
    } catch (error) {
        console.log(error, 'error')
        return res.json(response.failure(204, message.Catch_Error, error));
    }
}

/* get all student or get single */
exports.getStudent = async function (req, res) {
    try {
        let users;
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
        if (req.user.group == 5) {
            query.push({
                $match: { mobile: req.user.mobile }
            });
        }

        if (search) {
            query.push(
                {
                    '$match': {
                        '$or': [
                            {
                                name: { '$regex': new RegExp(search.toLowerCase().replace(/\s+/g, '\\s+'), 'gi') },
                            },
                            {
                                mobile: { '$regex': new RegExp(search.toLowerCase().replace(/\s+/g, '\\s+'), 'gi') },
                            },
                            {
                                'studentDetails.fatherName': { '$regex': new RegExp(search.toLowerCase().replace(/\s+/g, '\\s+'), 'gi') },
                            },
                            {
                                'studentDetails.class': { '$regex': new RegExp(search.toLowerCase().replace(/\s+/g, '\\s+'), 'gi') },
                            },
                            {
                                'studentDetails.rollNo': { '$regex': new RegExp(search.toLowerCase().replace(/\s+/g, '\\s+'), 'gi') },
                            },
                        ]
                    }
                },
            )
        }

        query.push(
            { $match: { isDelete: false, group: 5 } },
            {
                $lookup: {
                    localField: "school",
                    foreignField: "_id",
                    from: "schools",
                    as: "schoolInfo"
                }
            },
            {
                $unwind: { path: "$schoolInfo", preserveNullAndEmptyArrays: false } /* false means empty array data not show */
            },
            { $sort: { _id: -1 } },
        );

        // if (req.query.page && req.query.limit) {
        //     let limit = 10;
        //     const reqPage = Math.max(0, Number(req.query.page));
        //     if (Number(req.query.limit)) {
        //         limit = Number(req.query.limit);
        //     }
        //     const page = limit * reqPage;
        //     // const page = Number(req.query.page);
        //     // const limit = Number(req.query.limit);
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

        users = await Model.aggregate(query);

        if (req.query.id) {
            if (users.length == 0) return res.json(response.failure(204, message.user.student_not_exist));
            // else users = users[0];
        }

        return res.json(response.success(200, message.user.student_get_success, users));
    } catch (error) {
        console.log(error, 'error')
        return res.json(response.failure(204, message.Catch_Error, error));
    }
}

/* driver delete */
exports.removeDriver = async function (req, res) {
    try {
        const dataExist = await findUser({ _id: req.params._id });
        if (!dataExist) {
            return res.json(response.failure(204, message.user.driver_not_exist));
        }
        // const data = await Model.findByIdAndUpdate(filter, update, { new: true });
        const checkTrip = await TripDB.findOne({ 'driver._id': ObjectID(req.params._id), completed: false });
        if (!checkTrip) {
            const data = await Model.updateOne({ _id: req.params._id }, { $set: { isDelete: true } });
            await RouteDB.updateMany({ driver: req.params._id }, { $unset: { driver: 1 } }, { new: true });
            await BusDB.updateMany({ driver: req.params._id }, { $unset: { driver: 1 } }, { new: true });

            if (data) return res.json(response.success(200, message.user.driver_delete_success));
            return res.json(response.failure(204, message.user.driver_delete_error));
        }
        return res.json(response.failure(204, message.user.driver_in_current_trip));

    } catch (error) {
        console.log(error, 'error')
        return res.json(response.failure(204, message.Catch_Error, error));
    }
}

/* student delete */
exports.removeStudent = async function (req, res) {
    try {
        const dataExist = await findUser({ _id: req.params._id });
        if (!dataExist) {
            return res.json(response.failure(204, message.user.student_not_exist));
        }
        // const data = await Model.findByIdAndUpdate(filter, update, { new: true });
        const checkTrip = await TripDB.findOne({ 'students': ObjectID(req.params._id), completed: false });
        if (!checkTrip) {
            const data = await Model.updateOne({ _id: req.params._id }, { $set: { isDelete: true } });
            await RouteDB.updateMany({ students: req.params._id }, { $pull: { students: req.params._id } }, { new: true });
            await RouteDB.updateMany({ 'stops.students': req.params._id }, { $pull: { 'stops.$[].students': req.params._id } }, { new: true });

            if (data) return res.json(response.success(200, message.user.student_delete_success));
            return res.json(response.failure(204, message.user.student_delete_error));
        }
        return res.json(response.failure(204, message.user.student_in_current_trip));

    } catch (error) {
        console.log(error, 'error')
        return res.json(response.failure(204, message.Catch_Error, error));
    }
}

/* surveyor delete */
exports.removeSurveyor = async function (req, res) {
    try {
        const dataExist = await findUser({ _id: req.params._id });
        if (!dataExist) {
            return res.json(response.failure(204, message.user.surveyor_not_exist));
        }
        // const data = await Model.findByIdAndUpdate(filter, update, { new: true });
        const data = await Model.updateOne({ _id: req.params._id }, { $set: { isDelete: true } }, { new: true });
        await RouteDB.updateMany({ surveyor: req.params._id }, { $unset: { surveyor: 1 } }, { new: true });

        if (data) return res.json(response.success(200, message.user.surveyor_delete_success));
        return res.json(response.failure(204, message.user.surveyor_delete_error));

    } catch (error) {
        console.log(error, 'error')
        return res.json(response.failure(204, message.Catch_Error, error));
    }
}

exports.socketUpdateDriverLocation = async function (data, res) {
    try {
        let location = new Location(data);
        await location.save();
    } catch (error) {
        console.log(error, 'error')
    }
}

exports.updateDeviceToken = async function (req, res) {
    try {
        return new Promise(async (resolve, reject) => {
            const userFind = await Model.findOne({ _id: req.userId });
            if (userFind) {
                let user = await Model.updateOne({ _id: userFind._id }, req.body);
                return resolve(user);
            } else {
                return reject([]);
            }
        })
            .then(async (result) => {
                return res.json(response.success(200, message.user.token_success, []));
            })
            .catch(async (error) => {
                console.log(error);
                return res.json(response.failure(204, message.Catch_Error, error));
            });
        // let user = await Model.updateOne({ _id: req.params._id }, req.body.token);
        // return res.json(response.success(200, message.user.DATA_UPDATE, []));
    } catch (error) {
        return res.json(response.failure(204, message.Catch_Error, error));
    }
}

/* extra apis */
/* update driver location or location table data create by driver id */
exports.updateDriverLocation = async function (data, res) { // not in use
    try {
        var currentLocation = JSON.parse(
            JSON.stringify(data.location[data.location.length - 1])
        );
        // console.log(currentLocation, 'currentLocation')
        let user = await Model.findById(data._id);
        // console.log(user, 'user')
        let updatedLocation = await Model.updateOne(
            { _id: data._id },
            { $set: { "location": currentLocation } }
        );
        // console.log(updatedLocation, 'updatedLocation')
        if (updatedLocation) {
            // console.log(updatedLocation, 'updatedLocation')
            var io = data.io;
            currentLocation._id = data._id;
            currentLocation.updatedAt = new Date();
            io.to("all").emit("location", currentLocation);
            io.to(data._id).emit("location", currentLocation);
            io.emit("allLocation", currentLocation);

            let locations = data.location.map((element) => {
                let location = {
                    ...element,
                    updatedAt: element.updatedAt ? element.updatedAt : new Date(),
                    createdAt: element.updatedAt ? element.updatedAt : new Date(),
                    trip: data.trip ? data.trip : "",
                    driver: data._id ? data._id : "",
                    bus: data.bus ? data.bus : "",
                };
                return lodash.pickBy(location, lodash.identity);
            });
            // console.log(locations, 'locations variable')
            if (user) {
                for (let location of locations) {
                    // location = user.driverDetails;
                    let record = new Location(location);
                    await record.save();
                    console.log('save')
                }
            }
            return res.json(response.success(200, message.user.data_update_success));

        } else {
            return res.json(response.failure(204, message.user.user_not_exist));
        }
    } catch (error) {
        console.log(error, 'error')
        return res.json(response.failure(204, message.Catch_Error, error));
    }
}
