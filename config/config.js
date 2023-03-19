const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  port: process.env.PORT,
  databaseURL: process.env.MONGODB_URI,
  development_databaseURL: process.env.DEVELOPMENT_URI,

  secret: process.env.JWT_SECRET,

  aws: {
    accessKey: "AKIARXBPE3F2K7PZLAXS",
    secretKey: "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",
    templateBucket: "biotrips-docs"
  },

  pagination: {
    size: 40,
  }

  // environment: process.env.JWT_CLIENT_ID,
  // environment: process.env.JWT_TOKEN_EXPIRESDAYS,
  // environment: process.env.ENVIRONMENT,
  // awsAccessKey: process.env.AWS_ACCESS_KEY,
  // awsSecretKey: process.env.AWS_SECRET_KEY,
  // awsTemplateBucket: process.env.AWS_TEMPLATE_BUCKET,

};
