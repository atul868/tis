const AWS = require('aws-sdk');
const fs = require('fs');

const config = require('../config/config');

const awsDetails = config.aws;

const s3bucket = new AWS.S3({
    accessKeyId: awsDetails.accessKey,
    secretAccessKey: awsDetails.secretKey,
    Bucket: awsDetails.templateBucket,
});

const handleAWSUpload = async (file, uploadPath) => {
    return new Promise(function (resolve, reject) {
        try {
            fs.readFile(file.path, async function (err, data) {
                if (err) {
                    return reject(err);
                }
                const params = {
                    Bucket: awsDetails.templateBucket,
                    Key: uploadPath ? uploadPath : (file.originalname + "_" + Date.now()),
                    Body: data,
                    ContentType: file.mimetype,
                    ACL: 'public-read'
                };
                try {
                    const uploadDetails = await s3bucket.upload(params).promise();
                    return resolve(uploadDetails.Location);
                } catch (err) {
                    console.log(err);
                    return reject(err);
                }
            })
        } catch (err) {
            return reject(err);
        }

    });
}

module.exports = {
    handleAWSUpload,
    s3bucket
}