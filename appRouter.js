const express = require("express");
const keycloak = require("./keyCloak");

const router = express.Router();

router.get("/check-sso", keycloak.checkSso(), (req, res, next) => {
  console.log("request to /check-sso  - the user IS authenticated");
  console.log('Session: ', req.session);
  return res.send({ success: true, authenticated: true });
});

router.get("/test", keycloak.protect(), (req, res, next) => {
  console.log("request to /test - the user IS authenticated");
  console.log('Session: ', req.session);

  // console.log('grant: ', req.kauth.grant);
  const token = req.kauth.grant.access_token;
  console.log('----entire token: ', token);
  console.log('----token: ', token.token);
  console.log('------content: ', token.content);
  console.log('------user name: ', token.content.name, ', email: ', token.content.email);
  var permissions = token.authorization ? token.authorization.permissions : undefined;
  console.log('------permissions: ', permissions);

  return res.send({ success: true, authenticated: true });
});

router.get("/vanilla/*", keycloak.protect(), (req, res, next) => {
  console.log("request to /vanilla/*  - the user IS authenticated");
  console.log('Session: ', req.session);
  return res.send({ success: true, authenticated: true });
});

router.get("/", (req, res, next) => {
  console.log("request to /  - NOT PROTECTED PAGE");
  console.log('Session: ', req.session);
  return res.send({ success: true });
});

router.get("/test2", (req, res, next) => {
  console.log("request to /test2 - NOT PROTECTED PAGE");
  console.log('Session: ', req.session);
  return res.send({ success: true });
});

module.exports = router;
