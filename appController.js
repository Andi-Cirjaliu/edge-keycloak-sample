const TITLE = "Keycloak demo";

const getPage1 = (req, res, next) => {
  console.log("request to /page1  - the user IS authenticated");
  console.log("Session: ", req.session);

  let user;

  const grant = req.kauth.grant;
  // console.log('grant: ', grant);
  if (grant) {
    const token = grant.access_token;
    // console.log('----entire token: ', token);
    console.log("----token: ", token.token);
    console.log("------content: ", token.content);
    console.log(
      "------user name: ",
      token.content.name,
      ", email: ",
      token.content.email
    );
    var permissions = token.authorization
      ? token.authorization.permissions
      : undefined;
    console.log("------permissions: ", permissions);

    const name = token.content.name;
    const email = token.content.email;
    user = { name, email };
  }
  return res.render("private/page1", {
    pageTitle: TITLE,
    user: user,
    errorMsg: null,
  });
};

const getPage2 = (req, res, next) => {
  console.log("request to /page2  - the user IS authenticated");
  console.log("Session: ", req.session);

  let user;

  const grant = req.kauth.grant;
  // console.log('grant: ', grant);
  if (grant) {
    const token = grant.access_token;
    // console.log('----entire token: ', token);
    console.log("----token: ", token.token);
    console.log("------content: ", token.content);
    console.log(
      "------user name: ",
      token.content.name,
      ", email: ",
      token.content.email
    );
    var permissions = token.authorization
      ? token.authorization.permissions
      : undefined;
    console.log("------permissions: ", permissions);

    const name = token.content.name;
    const email = token.content.email;
    user = { name, email };
  }

  return res.render("private/page2", {
    pageTitle: TITLE,
    user: user,
    errorMsg: null,
  });
};

const getHomePage = (req, res, next) => {
  console.log("request to /  - NOT PROTECTED PAGE");
  console.log("Session: ", req.session);

  let user;

  const grant = req.kauth.grant;
  // console.log('grant: ', grant);
  if (grant) {
    const token = grant.access_token;
    // console.log('----entire token: ', token);
    console.log("----token: ", token.token);
    console.log("------content: ", token.content);
    console.log(
      "------user name: ",
      token.content.name,
      ", email: ",
      token.content.email
    );
    var permissions = token.authorization
      ? token.authorization.permissions
      : undefined;
    console.log("------permissions: ", permissions);

    const name = token.content.name;
    const email = token.content.email;
    user = { name, email };
  }

  return res.render("public/main", {
    pageTitle: TITLE,
    user: user,
    errorMsg: null,
  });
};

const checkSSO = (req, res, next) => {
  console.log("request to /check-sso  - PROTECTED PAGE");
  console.log("Session: ", req.session);

  let user;

  const grant = req.kauth.grant;
  console.log('grant: ', grant);
  if (grant) {
    const token = grant.access_token;
    // console.log('----entire token: ', token);
    console.log("----token: ", token.token);
    console.log("------content: ", token.content);
    console.log(
      "------user name: ",
      token.content.name,
      ", email: ",
      token.content.email
    );
    var permissions = token.authorization
      ? token.authorization.permissions
      : undefined;
    console.log("------permissions: ", permissions);

    const name = token.content.name;
    const email = token.content.email;
    user = { name, email };
  }

  return res.render("public/main", {
    pageTitle: TITLE,
    user: user,
    errorMsg: null,
  });
};

module.exports = { getHomePage, getPage1, getPage2, checkSSO };
