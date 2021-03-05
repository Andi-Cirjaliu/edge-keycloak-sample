const session = require('express-session');
const Keycloak = require('keycloak-connect');

const store = new session.MemoryStore();

const environment = process.env.NODE_ENV || 'production';
const authURL = process.env.AUTH_SERVER_URL || 'http://localhost:8080';
const authRealm = process.env.AUTH_REALM;
const authClient = process.env.AUTH_CLIENT || "myclient";
const authPublicKey = process.env.AUTH_PUBLIC_KEY;

console.log('Environment: ', environment);
console.log('authURL: ', authURL);
console.log('authRealm: ', authRealm);
console.log('authClient: ', authClient);
console.log('authPublicKey: ', authPublicKey);
console.log('NODE_TLS_REJECT_UNAUTHORIZED:', process.env.NODE_TLS_REJECT_UNAUTHORIZED)

const kcConfig = {
    "realm": authRealm,
    "auth-server-url": authURL,
    "ssl-required": "external", //"none" //"external"
    "resource": "vanilla",
    "public-client": true,
    "confidential-port": 0
  }
if (authPublicKey ) {
  kcConfig["realm-public-key"] = authPublicKey;
}
console.log('Keycloak options\n: ', kcConfig);
const keycloak = new Keycloak({ store }, kcConfig);
// console.log('keycloak: ', keycloak); 

keycloak.authenticated = (req) => {
  console.log('User authenticated---------------');

  let user = extractUserInfo(req);

  req.session.isAuthenticated = true;
  req.session.user = user;

  console.log("Session: ", req.session);
  console.log('-----------------------------');  
}

keycloak.deauthenticated = (req) => {
  console.log('User deauthenticated---------------');

  req.session.isAuthenticated = false;
  req.session.user = null;

  console.log("Session: ", req.session);
  console.log('-----------------------------');
}

keycloak.accessDenied = async (req, res) => {
  console.log('Access denied---------------');
  // console.log('Req: ', req);
  // console.log('Res: ', res);

  if ( req.kauth ) {
    console.log('grant: ', req.kauth.grant);
  } else {
    console.log('No grant...');
  }

  req.session.isAuthenticated = false;
  req.session.user = null;

  console.log("Session: ", req.session);
  console.log('-----------REQ CODE------------------');

  console.log(req.query);
  console.log(req.query.code);

  console.log('-----------------------------');

  console.log(keycloak.grantManager);

  if ( req.query.code ) {
    console.log('Try to get the token from access code ', req.query.code);

    try {
      let grant = await keycloak.grantManager.obtainFromCode(req.query.code);
      console.log("grant ", grant);
    } catch (err) {
      console.log("Failed to obtain a grant from code. error: ", err);
    }
  }

  res.send("You don't have access to this page");
}

const extractUserInfo = (req) => {
  if ( ! req.kauth ) {
    console.log('No grant found...');
    return null;
  } 

  let user;

  const grant = req.kauth.grant;
  // console.log('grant: ', grant);
  if (grant) {
    const token = grant.access_token;
    // console.log('----entire token: ', token);
    console.log("----token: ", token.token);
    console.log("------content: ", token.content);
    console.log(
      "------user id: ",
      token.content.sub,
      ", name: ",
      token.content.name,
      ", email: ",
      token.content.email
    );
    // var permissions = token.authorization
    //   ? token.authorization.permissions
    //   : undefined;
    // console.log("------permissions: ", permissions);

    const id = token.content.sub;
    const name = token.content.name;
    const email = token.content.email;
    user = { id, name, email };
  }

  return user;
}

module.exports = keycloak;