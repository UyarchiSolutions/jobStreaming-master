const express = require('express');
const authRoute = require('./auth.route');
const userRoute = require('./user.route');
const docsRoute = require('./docs.route');
const config = require('../../config/config');
const candidateRegistrationRoute = require('./candidateRegistration.route');
const employerRegistrationRoute = require('./employerRegistration.route');
const candidateDetailsRoute = require('./candidateDetails.route');
const employerdetailsRoute = require('./employerdetails.route');
const employerCandidateSearchRoute = require('./employerCandidateSearch.route');
const createPlanRoute = require('./createPlan.route');
const planPaymentDetailsRoute = require('./planPaymentDetails.route');
const educationDetailsRoute = require('./education.route');
const districtRoute = require('./district.route');
const faqeRoute = require('./admin.askQuestions.route');
const Dummy = require('./DummyDetails.route');
const JobAlert = require('./jobAlert.route');
const plan = require('./plans.route');
const RequestStream = require('./stream.request.route');
const b2buser = require('./B2Busers.route');
const menu = require('./menue.route');
const role = require('./role.route');
const router = express.Router();

const defaultRoutes = [
  {
    path: '/auth',
    route: authRoute,
  },
  {
    path: '/plan',
    route: plan,
  },
  {
    path: '/b2bUsers',
    route: b2buser,
  },
  {
    path: '/role',
    route: role,
  },
  {
    path: '/menu',
    route: menu,
  },
  {
    path: '/requeststream',
    route: RequestStream,
  },
  {
    path: '/JobAlert',
    route: JobAlert,
  },
  {
    path: '/users',
    route: userRoute,
  },
  {
    path: '/candidateRegistration',
    route: candidateRegistrationRoute,
  },
  {
    path: '/employerRegistration',
    route: employerRegistrationRoute,
  },
  {
    path: '/Dummy',
    route: Dummy,
  },
  {
    path: '/candidateDetail',
    route: candidateDetailsRoute,
  },
  {
    path: '/employerCandidateSearch',
    route: employerCandidateSearchRoute,
  },
  {
    path: '/employerdetail',
    route: employerdetailsRoute,
  },
  {
    path: '/createPlan',
    route: createPlanRoute,
  },
  {
    path: '/planPayment',
    route: planPaymentDetailsRoute,
  },
  {
    path: '/educationDetails',
    route: educationDetailsRoute,
  },
  {
    path: '/district',
    route: districtRoute,
  },
  {
    path: '/faqe',
    route: faqeRoute,
  },
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
