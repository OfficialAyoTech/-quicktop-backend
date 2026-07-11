const devAuth = (req, res, next) => {
  req.user = {
    uid: "test-user-001",
    email: "test@example.com",
  };

  next();
};

module.exports = devAuth;