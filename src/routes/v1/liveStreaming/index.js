const express = require('express');
const generateAuthTokens = require('./generateToken.route');
const multihostModal = require('./generateToken-multihost.route');
const chatModel = require('./chat.route');
const docsRoute = require('../docs.route');
const demostream = require('../liveStreaming/DemoStream.route');
const preevalution = require('../liveStreaming/preevalutionsStream.route');
const config = require('../../../config/config');

const router = express.Router();

const defaultRoutes = [
  {
    path: '/generateRTC',
    route: generateAuthTokens,
  },
  {
    path: '/multihost',
    route: multihostModal,
  },
  {
    path: '/chat',
    route: chatModel,
  },
  {
    path: "/demostream",
    route: demostream
  },
  {
    path: "/preevalution",
    route: preevalution
  }
];

const devRoutes = [
  // routes available only in development mode
  {
    path: '/docs',
    route: docsRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

/* istanbul ignore next */
if (config.env === 'development') {
  devRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
}

module.exports = router;
