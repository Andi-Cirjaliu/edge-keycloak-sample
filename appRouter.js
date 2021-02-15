const express = require("express");
const keycloak = require("./keyCloak");
const appController = require('./appController');

const router = express.Router();

const checkToken = (token, req) => {
    console.log('Check token-----------------------------');
    console.log('token is:', token);
    console.log('-----------------------------');
    if ( req.kauth ) {
        console.log('grant: ', req.kauth.grant);
      }
    console.log('-----------------------------');
  
    return true;
  }

//   function protectBySection(token, request) {
//     console.log('Check token-----------------------------');
//     console.log('token is:', token);
//     console.log('-----------------------------');
//     return true;
//   }


router.get("/page1", keycloak.protect(), appController.getPage1);

router.get("/page2", keycloak.protect(), appController.getPage2);

router.get("/", appController.getHomePage);

router.get("/check-sso", keycloak.checkSso(), appController.checkSSO);

router.get("/test_private", keycloak.protect( checkToken ), appController.getPage1);

router.get("/test_public", appController.getHomePage);

module.exports = router;
