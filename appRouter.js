const express = require("express");
const keycloak = require("./keyCloak");
const appController = require('./appController');

const router = express.Router();

// const checkUserRole = (token, request) => {
//     // console.log('Check user role. token: ', token);
//     console.log('has user role:', token.hasRole('user'));
//     console.log('has admin role:', token.hasRole('admin'));
//     return token.hasRole('user') || token.hasRole('admin');
// }

router.get("/", appController.getHomePage);

router.get("/posts", keycloak.protect(keycloak.checkUserRole), appController.getPosts);

router.get("/users", keycloak.protect(keycloak.checkAdminRole), appController.getUsers);

router.get("/test", keycloak.protect(keycloak.checkUserRole), appController.getHomePage);

router.get("/login", keycloak.protect(keycloak.checkUserRole), appController.getLoginPage);

router.get("/logoff", appController.getLogoffPage);
router.post("/logoff", appController.getLogoffPage);

router.get("/denied", appController.getAccessDeniedPage);

module.exports = router;
