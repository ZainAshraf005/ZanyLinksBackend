import bcrypt from "bcrypt";

const hashPassword = async (password) => {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    return hashedPassword;
  } catch (error) {
    console.error("error hashing password: ", error);
  }
};

export default hashPassword;
