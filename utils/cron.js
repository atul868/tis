var cron = require('node-cron');
const tripController = require('../modules/Trip/controller');
const tripModel = require("../modules/Trip/schema");
const locationModel = require("../modules/Location/schema");

// /* every minute cron for eta */
// exports.initScheduledJobs = (req, res) => {
//     const scheduledJobFunction = cron.schedule("*/10 * * * * *", async () => { // */5 per 5 sec cron
//         console.log("socket cron running every minute");
//         /* custom logic here */
//         try {
//             const tripData = await tripModel.find({ completed: false }); //findById
//             tripData.forEach(element => {
//                 tripController.distance(element._id);
//             });
//         } catch (error) {
//             console.log(error, 'error')
//             return res.json(response.failure(204, message.Catch_Error, error));
//         }
//         /* End custom logic */
//     });
//     scheduledJobFunction.start();
// }

/* every minute cron for eta */
exports.initScheduledJobs = (req, res) => {
    const scheduledJobFunction = cron.schedule("* * * * *", async () => { // */5 per 5 sec cron
        console.log("socket cron running every minute");
        /* custom logic here */
        try {
            const tripData = await tripModel.find({ completed: false }); //findById
            tripData.forEach(element => {
                // tripController.distanceFunction(element);
            });
        } catch (error) {
            console.log(error, 'error')
            return res.json(response.failure(204, message.Catch_Error, error));
        }
        /* End custom logic */
    });
    scheduledJobFunction.start();
}

    // // const utcnew = new Date(Y, M, D, h, m, s)
    // // console.log(utcnew)

    // const utcDate1 = new Date(Date.UTC());
    // const utcDate2 = new Date(Date.UTC(0, 0, 0, 0, 0, 0));

    // console.log(utcDate1.toUTCString());
    // console.log(utcDate2.toUTCString());

    // // function greet() {
    // //     console.log('Hello world');
    // // }
    // // setInterval(greet, 1000);

    // var date1 = new Date();
    // var hour = date1.getHours();
    // var min = date1.getMinutes();

    // const date = new Date();
    // const time = date.toTimeString().split(' ')[0].split(':');
    // console.log(time[0] + ':' + time[1])

    // // console.log(hour, min)
    // // console.log(new Date().toLocaleTimeString())
    // // console.log(new Date().toTimeString().split(" ")[0])
    // var time1 = '19 14'
    // // const scheduledJobFunction = cron.schedule(`${time1} * * *`, () => {
    // //     // function greet() {
    // //     //     console.log('Hello world');
    // //     // }
    // //     // setInterval(greet, 1000);
    // //     console.log('Running a job at 14:16 or 02:16 pm at Asia/Kolkata timezone');
    // // }, {
    // //     scheduled: true,
    // //     timezone: "Asia/Kolkata"
    // // });

    // // scheduledJobFunction.start();
// }