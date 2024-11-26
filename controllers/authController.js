import User from "../model/userModel.js";
import hashPassword from "../utils/bcrypt.js";
import comparePassword from "../utils/comparePassword.js";
import getToken from "../utils/getToken.js";
import fs from "fs";

const signup = async (req, res, next) => {
  try {
    const { fullName, username, email, password } = req.body;
    const fields = [fullName, username, email, password];
    if (!fields.every(Boolean)) {
      return res
        .status(400)
        .json({ message: "all fields are requried", success: false });
    }

    const userExists = await User.findOne({ $or: [{ username }, { email }] });
    if (userExists) {
      return res
        .status(401)
        .json({ message: "username or email already exists", success: false });
    }
    let admin = false;
    if (email === "zain@zain.com") {
      admin = true;
    }

    const hashedPassword = await hashPassword(password);
    const createdUser = await User.create({
      fullName,
      username,
      email,
      password: hashedPassword,
      isAdmin: admin,
    });

    res.status(200).json({
      message: "user created successfully",
      success: true,
      data: createdUser,
    });
  } catch (error) {
    next(error);
  }
};
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "all fields are required", success: false });
    }
    const userExists = await User.findOne({ email });
    if (!userExists) {
      return res
        .status(400)
        .json({ message: "invalid credentials", success: false });
    }

    const isMatch = await comparePassword(password, userExists.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "email or password is incorrect", success: false });
    }

    const tokenData = {
      userId: userExists._id,
      isAdmin: userExists.isAdmin,
      username: userExists.username,
    };

    const token = getToken(tokenData);

    return res
      .status(200)
      .cookie("token", token, {
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60 * 1000,
      })
      .json({
        message: "loggedIn successfully",
        success: true,
        data: await User.findOne({ email }).select({ password: 0 }),
      });
  } catch (error) {
    next(error);
  }
};
const logout = async (req, res, next) => {
  try {
    return res
      .status(200)
      .cookie("token", "", { maxAge: 0 })
      .json({ message: "logged out successfully", success: true });
  } catch (error) {
    next(error);
  }
};
const changePassword = async (req, res, next) => {
  try {
    const { password, newPassword } = req.body;
    if (!password || !newPassword) {
      return res.status(400).json({ message: "invalid data", success: false });
    }
    if (password === newPassword) {
      return res.status(400).json({
        message: "new password can't be same as old one",
        success: false,
      });
    }
    const userExists = await User.findById(req.id);
    if (!userExists) {
      return res
        .status(404)
        .json({ message: "user not found", success: false });
    }

    const isMatch = await comparePassword(password, userExists.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "old password is incorrect", success: false });
    }
    const hashedPassword = await hashPassword(newPassword);
    userExists.password = hashedPassword;

    await userExists.save();

    return res.status(200).json({ message: "password updated", success: true });
  } catch (error) {
    next(error);
  }
};
const deleteUser = async (req, res, next) => {
  try {
    const { email, username, password } = req.body;
    if (!email || !username || !password) {
      return res
        .status(400)
        .json({ message: "invalid credentials", success: false });
    }

    const userExists = await User.findOne({ email });
    if (!userExists) {
      return res
        .status(404)
        .json({ message: "invalid credentials user", success: false });
    }

    const isMatch = await comparePassword(password, userExists.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "email or password is incorrect", success: false });
    }
    const dir = `uploads/${userExists.username}`;
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
    }

    await userExists.deleteOne({ _id: userExists._id });

    return res
      .status(200)
      .cookie("token", "", { maxAge: 0 })
      .json({ message: "user deleted successfully", success: true });
  } catch (error) {
    next(error);
  }
};
const deleteUserByAdmin = async (req, res, next) => {
  try {
    const adminUser = await User.findOne({ _id: req.id });
    if (!adminUser && !adminUser.isAdmin) {
      return res
        .status(404)
        .json({ message: "user not found", success: false });
    }
    const { username } = req.body;
    if (!username) {
      return res.status(400).json({ message: "invalid data", success: false });
    }
    const user = await User.findOne({ username });
    if (!user) {
      return res
        .status(404)
        .json({ message: "user not found", success: false });
    }
    await user.deleteOne({ _id: user._id });
    return res.status(200).json({ message: "user deleted", success: true });
  } catch (error) {
    next(error);
  }
};
const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ message: "No file uploaded", success: false });
    }

    const filePath = req.file.path;

    // Update only the `profileImage` field for the user with the provided `username`
    const user = await User.findOneAndUpdate(
      { username: req.username }, // Query: Find user by username
      { $set: { profileImage: filePath } }, // Update: Set profileImage
      { new: true, runValidators: true } // Options: Return updated document and validate schema
    );

    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    res.status(200).json({
      message: "Image uploaded and path saved successfully!",
      filePath: `${req.protocol}://${req.get("host")}/${filePath}`,
      success: true,
    });
  } catch (error) {
    next(error); // Pass error to middleware
  }
};
const getImage = async (req, res, next) => {
  try {
    const { username } = req.params;
    if (!username) {
      return res.status(400).json({ message: "invalid data", success: false });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res
        .status(404)
        .json({ message: "user not found", success: false });
    }

    return res.status(200).json({
      message: "data fetched",
      success: true,
      profileImage: user.profileImage
        ? `${req.protocol}://${req.get("host")}/${user.profileImage}`
        : "",
      backgroundImage: user.backgroundImage
        ? `${req.protocol}://${req.get("host")}/${user.backgroundImage}`
        : "",
    });
  } catch (error) {
    next(error);
  }
};
const getUsers = async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.id });
    if (!user) {
      return res
        .status(404)
        .json({ message: "user not found", success: false });
    }
    if (!user.isAdmin) {
      return res
        .status(400)
        .json({ message: "unauthorized access", success: false });
    }

    const users = await User.find({ _id: { $ne: user._id } });
    return res
      .status(200)
      .json({ message: "user accessed", success: true, users: users });
  } catch (error) {
    next(error);
  }
};

export default {
  signup,
  login,
  logout,
  changePassword,
  deleteUser,
  uploadImage,
  getImage,
  getUsers,
  deleteUserByAdmin,
};
