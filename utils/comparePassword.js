import bcrypt, { compare } from "bcrypt";
const comparePassword = async (password, hashedPassword) => {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    console.error("error comparing password");
  }
};

export default comparePassword;
