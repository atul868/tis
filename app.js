const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const config = require('./config/config');
const connect = require('./config/dbConnection');
/* include cron function */
const scheduledFunctions = require('./utils/cron');

app.get("/", (req, res) => {
  res.send("App start...");
});

// connect.then((db) => {
//   console.log(`Connected to MongoDB`);
// }).catch((e) => {
//   console.error(`Could not init db\n${e.trace}`);
// });

app.use(cors());

// bodyparser middleware
app.use(bodyParser.json());

// routes
// require('./modules/Admin/router')(app);
require('./modules/Bus/router')(app);
require('./modules/Help/router')(app);
require('./modules/Notification/router')(app);
// require('./modules/Review/router')(app);
require('./modules/Route/router')(app);
require('./modules/Trip/router')(app);
require('./modules/User/router')(app);
require('./modules/NoticeBoard/router')(app);
require('./modules/Feedback/router')(app);


// const server = express()
//   .use(app)
//   .listen(config.port, () => console.log(`Listening on Port: ${config.port}`));

connect.then((err, db) => {
  // console.log(`Connected to MongoDB`);
  var server = app.listen(`${config.port}`, function () {
    var host = server.address().address
    var port = server.address().port
    let io = require('./utils/socket')(server);
    app.set('io', io);
    console.log("Listening on Port: ", port)
    console.log(`Connected to MongoDB`);
  })
}).catch((err) => {
  console.log(err);
})

/* call cron function */
scheduledFunctions.initScheduledJobs();