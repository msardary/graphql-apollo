const { AuthenticationError } = require("apollo-server");
const jwt = require("jsonwebtoken");

const verifyToken = (token, secret_key) => {
  if (token) {
    const decodedToken = jwt.verify(token, secret_key);
    if (decodedToken) {
      return decodedToken;
    } else {
      throw new AuthenticationError("Invalid Token");
    }
  } else {
    return undefined;
  }
};

module.exports = verifyToken;
