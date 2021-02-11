const session = require('express-session');
const Keycloak = require('keycloak-connect');

const store = new session.MemoryStore();

console.log('process.env.AUTH_REALM: ', process.env.AUTH_REALM);
console.log('process.env.AUTH_SERVER_URL: ', process.env.AUTH_SERVER_URL);
console.log('process.env.AUTH_CLIENT: ', process.env.AUTH_CLIENT);
const kcConfig = {
    "realm": process.env.AUTH_REALM || "myrealm",
    "auth-server-url": process.env.AUTH_SERVER_URL || "http://localhost:8080/auth/",
    "ssl-required": "external",
    "resource": process.env.AUTH_CLIENT || "myclient",
    "public-client": true,
    "confidential-port": 0
  }
console.log('Keycloak options: ', kcConfig);
const keycloak = new Keycloak({ store }, kcConfig);
// console.log('keycloak: ', keycloak); 

module.exports = keycloak;