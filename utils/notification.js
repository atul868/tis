var admin = require("firebase-admin");

var serviceAccount = require("../mantis-3ff29-firebase-adminsdk-igt9s-8d249f77ac.json");

console.log("Notification service started");
// console.log(serviceAccount);
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
})

// topic = "general";
// var message = {
//   notification: {
//     title: 'Message from node',
//     body: 'hey there'
//   },
//   topic: topic
// };

function sendNotification(message) {
    return admin.messaging().send(message)
        .then((response) => {
            // Response is a message ID string.
            console.log('Successfully sent message:', response);
            return response;
        })
        .catch((error) => {
            console.log('Error sending message:', error);
            return error;
        });
}

module.exports = { sendNotification };