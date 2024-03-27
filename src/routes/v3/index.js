const express = require('express');
const candidate = require('./candidate.route');
const interview = require('./interview.route');
const router = express.Router();


const defaultRoutes = [
  {
    path: '/candidate',
    route: candidate,
  },
  {
    path: '/interview',
    route: interview,
  },



];



defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});



module.exports = router;
