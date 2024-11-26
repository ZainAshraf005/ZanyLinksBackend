import jwt from "jsonwebtoken";

const verifyToken = (token) => {
  try {
    if (!process.env.JWT_SECRET_KEY)
      throw new Error("JWT_SECRET_KEY is missing");
    return jwt.verify(token, process.env.JWT_SECRET_KEY);
  } catch (error) {
    throw new Error("Error verifying token");
  }
};

export default verifyToken;
