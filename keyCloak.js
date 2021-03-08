const session = require('express-session');
const Keycloak = require('keycloak-connect');
const storeCtrl = require('./memoryStoreController');
const store = storeCtrl.store1; //new session.MemoryStore();

const environment = process.env.NODE_ENV || 'production';
const authURL = process.env.AUTH_SERVER_URL || 'http://localhost:8080';
const authRealm = process.env.AUTH_REALM;
const authClient = process.env.AUTH_CLIENT || "myclient";
const authPublicKey = process.env.AUTH_PUBLIC_KEY;
const authSSLRequired = process.env.AUTH_SSL_REQUIRED || 'external';

console.log('Environment: ', environment);
console.log('authURL: ', authURL);
console.log('authRealm: ', authRealm);
console.log('authClient: ', authClient);
console.log('authPublicKey: ', authPublicKey);
console.log('authSSLRequired: ', authSSLRequired);
console.log('NODE_TLS_REJECT_UNAUTHORIZED:', process.env.NODE_TLS_REJECT_UNAUTHORIZED)

const kcConfig = {
    "realm": authRealm,
    "auth-server-url": authURL,
    "ssl-required": authSSLRequired, //"none" //"external"
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

  console.log('Keycloak: ', keycloak);
  let user = extractUserInfo( req.kauth ? req.kauth.grant : undefined);

  req.session.isAuthenticated = true;
  req.session.user = user;

  console.log("Session: ", req.session.id, ' - ',req.session);
  storeCtrl.printStore(store);
  console.log('-----------------------------');  
}

keycloak.deauthenticated = (req) => {
  console.log('User deauthenticated---------------');

  console.log('Keycloak: ', keycloak);

  if ( req.session ) {
    req.session.isAuthenticated = false;
    req.session.user = null;
  }

  // req.session.destroy(function(err) {
  //   // cannot access session here
  //   if ( err ) {
  //     console.log('Error occured when invalidatin session: ', err);
  //   }
  // });

  console.log("Session: ", req.session.id, ' - ',req.session);
  storeCtrl.printStore(store);
  console.log('-----------------------------');

  const sessionId = req.session.id; 
  console.log("Session id: ", sessionId);
  // require('./memoryStore').destroy(sessionId, (err) => {
  //   if ( err ) {
  //     console.log('An error occured when destroing session ', sessionId );
  //   }
  //   console.log('session ', sessionId , ' was destroyed.');
  // });
}

keycloak.accessDenied = async (req, res) => {
  console.log('Access denied---------------');
  // console.log('Req: ', req);
  // console.log('Res: ', res);

  console.log('Keycloak: ', keycloak);

  if ( req.kauth ) {
    console.log('grant: ', req.kauth.grant);
  } else {
    console.log('No grant...');
  }

  // req.session.isAuthenticated = false;
  // req.session.user = null;

  console.log("Session: ", req.session.id, ' - ',req.session);
  storeCtrl.printStore(store);
  console.log('-----------REQ CODE------------------');

  console.log(req.query);
  // console.log(req.query.code);

  console.log('-----------------------------');

  // try {
  //   console.log("-------- Get grant ... ");
  //   let grant = await keycloak.getGrant(req, res);
  //   console.log("-------- grant is ", grant);

  //   let user = extractUserInfo(grant);

  //   req.session.isAuthenticated = true;
  //   req.session.user = user;
  // } catch (err) {
  //   console.log("Failed to obtain a grant. error: ", err);
  // }

  try {
    console.log("-------- Get grant from code ", req.query.code);
    let grant = await keycloak.getGrantFromCode(req.query.code, req, res);
    console.log("-------- successfully get grant from code ....");

    let user = extractUserInfo(grant);

    req.session.isAuthenticated = true;
    req.session.user = user;

    return res.redirect('/');
  } catch (err) {
    console.log("Failed to obtain a grant from code. error: ", err);
  }

  // console.log(keycloak.grantManager);

  // if ( req.query.code ) {
  //   console.log('Try to get the token from access code ', req.query.code);

  //   try {
  //     let grant = await keycloak.grantManager.obtainFromCode(req.query.code);
  //     console.log("grant ", grant);
  //   } catch (err) {
  //     console.log("Failed to obtain a grant from code. error: ", err);
  //   }
  // }

  res.redirect('/denied');
  //res.send("You don't have access to this page");
}

const extractUserInfo = (grant) => {
  console.log('------------------ Extract user info ---------------')

  if ( ! grant ) {
    console.log('No grant found...');
    return null;
  } 

  let user;

  // const grant = req.kauth.grant;
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