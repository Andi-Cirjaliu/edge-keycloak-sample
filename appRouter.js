const express = require("express");
const keycloak = require("./keyCloak");
const appController = require('./appController');

const router = express.Router();

router.get("/", appController.getHomePage);

router.get("/posts", keycloak.protect(), appController.getPosts);

router.get("/login", keycloak.protect(), appController.getLoginPage);

router.get("/logoff", appController.getLogoffPage);
router.post("/logoff", appController.getLogoffPage);

router.get("/denied", appController.getAccessDeniedPage);

module.exports = router;
