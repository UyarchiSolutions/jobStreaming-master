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
const logger = require('./config/logger');
const cookieparser = require('cookie-parser');

const chetModule = require('./services/liveStreaming/chat.service');

const { errorConverter, errorHandler } = require('./middlewares/error');
const ApiError = require('./utils/ApiError');

const app = express();
const bodyParser = require('body-parser');
let http = require('http');
let server = http.Server(app);
let socketIO = require('socket.io');
let io = socketIO(server);

server.listen(config.port, () => {
  logger.info(`Listening to port ${config.port}`);
});
io.sockets.on('connection', async (socket) => {
  socket.on('groupchat', async (data) => {
    await chetModule.chat_room_create(data, io);
  });
  socket.on('admin_approve', async (data) => {
    await chetModule.admin_approve(data, io);
  });
  socket.on('rice_hands', async (data) => {
    await chetModule.rice_hands(data, io);
  });
  socket.on('', (msg) => {
    console.log('message: ' + msg);
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
// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);

module.exports = app;
