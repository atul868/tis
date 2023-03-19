const message = require("./message");
const response = require("../utils/response");

const axios = require("axios");
// const tripController = require('../modules/Trip/controller');

exports.sendMobileOtp = function (member, otp, otpAutoFill) {
    // var sendMobileOtp = (member, otp) =>
    new Promise(async (resolve, reject) => {
        // if (config.get('isTesting') || !member.phone) return resolve();
        // let reqesut = `http://kyi.solutions/V2/http-api.php?apikey=E2NtwuyaiJK9d1hV&senderid=BIOTPS&number=${member.phone}&message=Welcome to the BioTrips family! Your OTP for logging into the BioTrips app is ${otp} ${otpAutoFill}#var#}&format=json`;
        let reqesut = `http://kyi.solutions/V2/http-api.php?apikey=E2NtwuyaiJK9d1hV&senderid=BIOTPS&number=${member.phone}&message=Welcome to the BioTrips family Your OTP for logging into the app is ${otp} 
        
${otpAutoFill} &format=json`;
        console.log("*** Sending Otp to ", member.phone);
        console.log("*** Sending Otp is ", otp);
        console.log(reqesut, 'reqesut')
        axios({
            method: "POST",
            // data: {},
            url: reqesut,
            headers: {
                "Content-Type": "application/json",
                Cookie: "PHPSESSID=k7sqrc14mlu1235h4821mfbvsj",
            },
        })
            .then(function (response) {
                console.log(JSON.stringify(response.data));
            })
            .catch(function (error) {
                console.log(error);
            });
        return resolve();
    });
}

exports.sendSos = function (member, otp) {
    
    console.log(member, 'member', otp, 'otp', '---------------------------')
    new Promise(async (resolve, reject) => {
        // let reqesut = `http://kyi.solutions/V2/http-api.php?apikey=E2NtwuyaiJK9d1hV&senderid=BIOTPS&number=${member.phone}&message=Welcome to the BioTrips family! Your OTP for logging into the BioTrips app is ${otp} ${otpAutoFill}#var#}&format=json`;
        let reqesut = `http://kyi.solutions/V2/http-api.php?apikey=E2NtwuyaiJK9d1hV&senderid=BIOTPS&number=${member.phone}&message=Welcome to the BioTrips family Your OTP for logging into the app is ${otp} &format=json`;
        console.log("*** Sending Otp to ", member.phone);
        console.log("*** Sending Otp is ", otp);
        console.log(reqesut, 'reqesut')
        axios({
            method: "POST",
            // data: {},
            url: reqesut,
            headers: {
                "Content-Type": "application/json",
                Cookie: "PHPSESSID=k7sqrc14mlu1235h4821mfbvsj",
            },
        })
            .then(function (response) {
                console.log(JSON.stringify(response.data));
            })
            .catch(function (error) {
                console.log(error);
            });
        return resolve();
    });
}

// exports.row = async (req, res) => { //distance function for frontend
//     try {
//         req.rows.forEach(element => {
//             // element.forEach(elemen => {
//             console.log(element, 'element')
//             // });
//             // tripController.elements(element)
//             // console.log(element, 'elemen')
//         });
//     } catch (error) {
//         console.log(error)
//         return res.json(response.failure(204, message.Catch_Error, error));
//     }
// }