import jwt from "jsonwebtoken";

const getToken = (tokenData) => {
  try {
    if (!process.env.JWT_SECRET_KEY) {
      throw new Error("JWT_SECRET_KEY environmental variable is missing");
    }

    return jwt.sign(tokenData, process.env.JWT_SECRET_KEY, {
      expiresIn: "1d",
    });
  } catch (error) {
    console.error("Error generating token: ", error);
  }
};

export default getToken;
