const session = require('express-session');
const Keycloak = require('keycloak-connect');
const storeCtrl = require('./sessionStoreController');
const store = storeCtrl.store; //new session.MemoryStore();

const environment = process.env.NODE_ENV || 'production';
const authURL = process.env.AUTH_SERVER_URL || 'http://localhost:8080';
const authRealm = process.env.AUTH_REALM;
const authClient = process.env.AUTH_CLIENT || "myclient";
const authPublicKey = process.env.AUTH_PUBLIC_KEY;
const authSSLRequired = process.env.AUTH_SSL_REQUIRED || 'external';

let roleType = process.env.AUTH_ROLE_TYPE || 'client';
if ( roleType !== 'client' && roleType !== 'realm' ) {
  roleType = 'client';
}
let userRole = process.env.AUTH_USER_ROLE || 'user';
// console.log('userRole: ', userRole);
if ( roleType === 'realm' ) {
  userRole = 'realm:'+userRole;
}
let adminRole = process.env.AUTH_ADMIN_ROLE || 'admin';
// console.log('adminRole: ', adminRole);
if ( roleType === 'realm' ) {
  adminRole = 'realm:'+adminRole;
}

console.log('Environment: ', environment);
console.log('authURL: ', authURL);
console.log('authRealm: ', authRealm);
console.log('authClient: ', authClient);
console.log('authPublicKey: ', authPublicKey);
console.log('authSSLRequired: ', authSSLRequired);
console.log('roleType: ', roleType);
console.log('userRole: ', userRole);
console.log('adminRole: ', adminRole);
// console.log('NODE_TLS_REJECT_UNAUTHORIZED:', process.env.NODE_TLS_REJECT_UNAUTHORIZED)

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
  console.log('-----------------User authenticated---------------');

  // console.log('Keycloak: ', keycloak);
  let user = extractUserInfo( req.kauth ? req.kauth.grant : undefined);

  req.session.isAuthenticated = true;
  req.session.user = user;
  req.session.isAdmin = checkIfAdmin(user, req.kauth.grant.access_token);

  console.log("Session: ", req.session.id, ' - ',req.session);
  // storeCtrl.printStore();
  console.log('-----------------------------');  
}

keycloak.deauthenticated = (req) => {
  console.log('-----------------User deauthenticated---------------');

  if ( req.session ) {
    req.session.isAuthenticated = false;
    req.session.user = null;
    req.session.isAdmin = false;
  }

  console.log("Session: ", req.session.id, ' - ',req.session);
  // storeCtrl.printStore();
  console.log('-----------------------------');

   // req.session.destroy(function(err) {
  //   // cannot access session here
  //   if ( err ) {
  //     console.log('Error occured when invalidatin session: ', err);
  //   }
  // });

  // const sessionId = req.session.id; 
  // console.log("Session id: ", sessionId);
  // require('./memoryStore').destroy(sessionId, (err) => {
  //   if ( err ) {
  //     console.log('An error occured when destroing session ', sessionId );
  //   }
  //   console.log('session ', sessionId , ' was destroyed.');
  // });
}

keycloak.accessDenied = async (req, res) => {
  console.log('-----------------Access denied---------------');

  // if ( req.kauth ) {
  //   console.log('grant: ', req.kauth.grant);
  // } else {
  //   console.log('No grant...');
  // }

  console.log("Session: ", req.session.id, ' - ',req.session);
  // storeCtrl.printStore();
  console.log('-----------REQ CODE------------------');

  console.log(req.query);
  // console.log(req.query.code);

  console.log('-----------------------------');

  let errorMsg;

  for (i = 1; i <= 2; i++) {
    try {
      console.log("-------- Try to get grant from code ", req.query.code);
      let grant = await keycloak.getGrantFromCode(req.query.code, req, res);
      console.log("-------- successfully get grant from code ....");

      let user = extractUserInfo(grant);

      req.session.isAuthenticated = true;
      req.session.user = user;
      req.session.isAdmin = checkIfAdmin(user, grant.access_token);

      return res.redirect("/");
    } catch (err) {
      errorMsg = err.message;
      console.log("Failed to obtain a grant from code. error: ", err);
    }
  }

  console.log('errorMsg: ', errorMsg);
  
  let statusCode = 302;
  let err;
  if (errorMsg.includes("ECONNREFUSED")) {
    statusCode = 301;
    err = 1;
  // } else if (errorMsg.includes("Bad Request")) {
  //   statusCode = 301;
  //   err = 11;
  }
  console.log('Status code: ', statusCode, ', err: ', err);  

  if ( err ) {
    return res.redirect(statusCode, `/500?err=${err}`);
  } 

  res.redirect(statusCode, '/denied');
  // res.redirect('/denied');  
  //res.send("You don't have access to this page");
}

const extractUserInfo = (grant) => {
  console.log('------------------ Extract user info ---------------')

  if ( ! grant ) {
    console.log('No grant found...');
    return null;
  } 

  let user;

  // console.log('grant: ', grant);

  if (grant) {
    const token = grant.access_token;
    // console.log('----entire token: ', token);
    console.log("----token: ", token.token);
    console.log("------content: ", token.content);
    console.log("------content resource access - realm roles: ", token.content.realm_access.roles);
    // console.log("------content resource access - account- roles: ", token.content.resource_access.account.roles);    
    console.log("------content resource access - client- roles: ", token.content.resource_access[authClient]);    
    console.log(
      "------user id: ",
      token.content.sub,
      ", name: ",
      token.content.name,
      ", email: ",
      token.content.email
    );

    var permissions = token.authorization
      ? token.authorization.permissions
      : undefined;
    console.log("------permissions (token): ", permissions);

    const id = token.content.sub;
    const name = token.content.name;
    const email = token.content.email;
    user = { id, name, email };

    //check user roles on realm
    user.realm_roles = token.content.realm_access.roles;
    //check user roles on client
    user.client_roles = [];
    if (token.content.resource_access[authClient]) {
      user.client_roles = token.content.resource_access[authClient].roles;
    }
  }

  console.log("------user info: ", user);

  return user;
}

keycloak.checkUserRole = (token, request) => {
  console.log('Check user role...');
  // console.log('token: ', token);
  console.log('has user role:', token.hasRole(userRole));
  console.log('has admin role:', token.hasRole(adminRole));
  return token.hasRole(userRole) || token.hasRole(adminRole);
}

keycloak.checkAdminRole = (token, request) => {
  console.log('Check admin role...');
  // console.log('token: ', token);
  console.log('has admin role:', token.hasRole(adminRole));
  return token.hasRole(adminRole);
}

const checkIfAdmin = (user, token) => {
  console.log('Check if user ', user.name, ' is admin.');

  let isAdmin = false;

  if ( token ) {
    isAdmin = token.hasRole(adminRole);
  } 

  // if ( adminRole.startsWith('realm:')) {
  //   const role = adminRole.substr('realm:'.length);
  //   isAdmin = user.realm_roles.includes(role);
  // } else {
  //   isAdmin = user.client_roles.includes(adminRole);
  // }

  console.log('user ', user.name, ' is admin: ', isAdmin);

  return isAdmin;
}

module.exports = keycloak;