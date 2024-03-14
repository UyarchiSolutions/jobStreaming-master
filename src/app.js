const express = require('express');
const helmet = require('helmet');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');
const cors = require('cors');
const passport = require('passport');
const httpStatus = require('http-status');
const config = require('./config/config');
const morgan = require('./config/morgan');
const { jwtStrategy } = require('./config/passport');
const { authLimiter } = require('./middlewares/rateLimiter');
const routes = require('./routes/v1');
const routes_v2 = require('./routes/v1/liveStreaming');
const routes_v3 = require('./routes/v3/index');
const logger = require('./config/logger');
const cookieparser = require('cookie-parser');
const initSocketService = require('./socket.io/socket.service');
const chetModule = require('./services/liveStreaming/chat.service');

const { errorConverter, errorHandler } = require('./middlewares/error');
const ApiError = require('./utils/ApiError');

const app = express();
const bodyParser = require('body-parser');
let http = require('http');
let server = http.Server(app);
let socketIO = require('socket.io');
let io = socketIO(server);
const moment = require('moment');

server.listen(config.port, () => {
  logger.info(`Listening to port ${config.port}`);
  //  console.log(new Date(moment('21-12-2023 12:00 PM', 'DD-MM-YYYY hh:mm A').toISOString()).getTime());
  // console.log(moment('21-12-2023 12:00 PM', 'DD-MM-YYYY hh:mm A').toISOString());
  // console.log(moment(1703140200000).format("DD-MM-yyyy hh:mm a"))
});



io.sockets.on('connection', async (socket) => {

  console.log("Connection Successfully established")
  socket.on('groupchathost_demo', async (data) => {
    await chetModule.chat_room_create_host_demo(data, io);
  });
  socket.on('groupchathost_demo_buyer', async (data) => {
    await chetModule.chat_room_create_host_demo_sub(data, io);
  });
  socket.on('privateChat', async (data) => {
    // await privatechat.recived_message(data, io, socket.handshake.auth);
  });

});
app.use(function (req, res, next) {
  req.io = io;
  next();
});

app.use(express.static('public'));

if (config.env !== 'test') {
  app.use(morgan.successHandler);
  app.use(morgan.errorHandler);
}
const { S3 } = require('aws-sdk');
require('aws-sdk/lib/maintenance_mode_message').suppress = true;
// set security HTTP headers
app.use(helmet());

// parse json request body
app.use(express.json());

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// sanitize request data
app.use(xss());
app.use(mongoSanitize());

// gzip compression
app.use(compression());

// enable cors
const corsconfig = {
  credentials: true,
  origin: '*',
};
// git develper
app.use(cors());
app.options('*', cors());
app.use(cookieparser());

// jwt authentication
app.use(passport.initialize());
passport.use('jwt', jwtStrategy);
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.use(bodyParser.json());

// limit repeated failed requests to auth endpoints
if (config.env === 'production') {
  app.use('/v1/auth', authLimiter);
}
// v1 api routes
app.use('/v1', routes);
app.use('/v2', routes_v2);
app.use('/v3', routes_v3);
app.get('/', (req, res) => {
  res.sendStatus(200);
});
// send back a 404 error for any unknown api request
app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, 'Not found'));
});

app.get('/v1', (req, res) => {
  res.sendStatus(200);
});

app.get('/', (req, res) => {
  res.sendStatus(200);
});
app.get('/health', (req, res) => {
  res.sendStatus(200);
});

app.get('/login.html', (req, res) => {
  res.sendStatus(200);
});
initSocketService(server, io);


// /login.html 
// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);

module.exports = app;


