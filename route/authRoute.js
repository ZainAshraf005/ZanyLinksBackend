import express from "express";
import validator from "../middlewares/validatorMiddleware.js";
import validate from "../validator/authValidator.js";
import auth from "../controllers/authController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import upload from "../middlewares/multerProfile.js";

const router = express.Router();

router.route("/signup").post(auth.signup);
router.route("/login").post(validator(validate.loginSchema), auth.login);
router.route("/update-password").post(authMiddleware, auth.changePassword);
router.route("/user/delete").post(authMiddleware, auth.deleteUser);
router.route("/logout").get(auth.logout);
router.route("/admin/users").get(authMiddleware, auth.getUsers);
router.route("/admin/user/delete").post(authMiddleware, auth.deleteUserByAdmin);
router.route("/:username/image").get(auth.getImage);

router
  .route("/upload/profile")
  .post(authMiddleware, upload.single("image"), auth.uploadImage);

export default router;
