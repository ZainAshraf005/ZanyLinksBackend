import verifyToken from "../utils/verifyToken.js";

const authMiddleware = (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(400).json({ message: "user not authenticated" });
    }
    const decode = verifyToken(token);
    if (!decode) {
      return res.status(400).json({ message: "invalid token" });
    }

    req.id = decode.userId;
    req.isAdmin = decode.isAdmin;
    req.username = decode.username;

    next();
  } catch (error) {
    next(error);
  }
};

export default authMiddleware;
