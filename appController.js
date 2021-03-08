const { default: axios } = require("axios");
const storeCtrl = require('./sessionStoreController');

const TITLE = "Keycloak demo";

const getHomePage = (req, res, next) => {
  console.log("request to /  - NOT PROTECTED PAGE");
  console.log("Session: ", req.session.id, ' - ',req.session);
  storeCtrl.printStore();

  return res.render("public/main", {
    pageTitle: TITLE,
    isAuthenticated: req.session.isAuthenticated,
    path: "/",
    user: req.session.user,
    errorMsg: null,
  });
};

const getLoginPage = (req, res, next) => {
  console.log("request to /login  - PROTECTED PAGE");
  // console.log("Session: ", req.session);

  return res.redirect("/");
};

const getLogoffPage = (req, res, next) => {
  console.log("request to /logoff  - NOT PROTECTED PAGE");
  console.log("Session: ", req.session.id, ' - ',req.session);

  return res.redirect("/logout");
};

const getPosts = async (req, res, next) => {
  console.log("request to /posts  - the user IS authenticated");
  console.log("Session: ", req.session);

  try {
    const response = await axios.get(
      "https://jsonplaceholder.typicode.com/users/1/posts"
    );
    const posts = response.data;
    console.log(posts);

    return res.render("private/posts", {
      pageTitle: TITLE,
      isAuthenticated: req.session.isAuthenticated,
      path: "/posts",
      user: req.session.user,
      data: posts,
      errorMsg: null,
    });
  } catch (error) {
    console.log("Failed to retrieve the posts. error: ", error);
    return res.render("private/posts", {
      pageTitle: TITLE,
      isAuthenticated: req.session.isAuthenticated,
      path: "/posts",
      user: req.session.user,
      data: null,
      errorMsg: "Failed to retrieve the posts!",
    });
  }
};

const getAccessDeniedPage = (req, res, next) => {
  console.log("request to /denied  - NOT PROTECTED PAGE");
  console.log("Session: ", req.session.id, ' - ',req.session);
  storeCtrl.printStore();

  return res.render("public/404", {
    pageTitle: TITLE,
    isAuthenticated: req.session.isAuthenticated,
    path: "/",
    user: req.session.user,
    errorMsg: "You don't have access to this page",
  });
};

const checkSSO = (req, res, next) => {
  console.log("request to /check-sso  - PROTECTED PAGE");
  console.log("Session: ", req.session);

  let user;

  const grant = req.kauth.grant;
  console.log("grant: ", grant);
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

module.exports = {
  getHomePage,
  getLoginPage,
  getPosts,
  getLogoffPage,
  getAccessDeniedPage,
  checkSSO,
};
