var ObjectID = require("mongoose").Types.ObjectId
const message = require("../../utils/message");
const response = require("../../utils/response");
const notification = require("../../utils/notification");
const pagination = require("../../config/config")["pagination"];
const notificationModel = require("./schema");
const userModel = require("../User/schema");
const tripModel = require("../Trip/schema");

const {  } = require('./dbQuery');

exports.busStartNotification = async function (studentId, res) {
    // const userData = await userModel.findOne({ _id: studentId });
    // studentId.forEach(element => {
    //     notificationModel.create({ students: element._id });
    // });
    const allToken = await userModel.find({ _id: studentId });
    allToken.forEach(async (token) => {
        if (token.token) {
            const message = {
                notification: {
                    title: "Mantis",
                    body: `Hey ${allToken.name} your bus start now, be ready`,
                },
                token: token.token,
            };
            // if (userData.profileImage) {
            //     message.android = {
            //         notification: {
            //             imageUrl: `${userData.profileImage}`,
            //         },
            //     };
            // }
            let msg = notification.sendNotification(message);
            console.log(msg, "msg");
        }
    })
}

exports.setTimeNotification = async function (req, tripData, durationValue) {
    for (let i = 0; i < req.students.length; i++) {
        let student = await userModel.findOne({ _id: req.students[i]._id });
        if (student) {
            // if (req.duration <= student.notificationTime) {
            console.log(student.name, parseInt(durationValue / 60) == parseInt(student.notificationTime), 'equal value')
            console.log(student.name, parseInt(durationValue / 60), parseInt(student.notificationTime), 'time and value')

            if (parseInt(durationValue / 60) == parseInt(student.notificationTime)) {
                if (student.token) {
                    const message = {
                        notification: {
                            title: "Mantis",
                            body: `Hey ${student.name}, Your bus arriving in ${req.duration} minutes`,
                        },
                        token: student.token,
                    };
                    let msg = notification.sendNotification(message);
                    console.log(msg, "msg");
                }
                // console.log('yes reached')
            }
        }
    }
}