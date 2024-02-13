const express = require('express');
const candidate = require('./candidate.route');
const router = express.Router();


const defaultRoutes = [
  {
    path: '/candidate',
    route: candidate,
  },


];



defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});



module.exports = router;
