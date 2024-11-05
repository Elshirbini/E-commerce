import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  let token;
  if (req.headers.cookie) {
    token = req.headers.cookie.split("jwt=")[1];
  }
  if (!token) {
    return res.status(400).send("You are not authenticated");
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async(err, user) => {
    if (err) res.status(401).send("Token is not valid");
    req.user = user;
    next();
  });
};
