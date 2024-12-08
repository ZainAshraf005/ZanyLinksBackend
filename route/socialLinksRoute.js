import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import socialLinks from "../controllers/socialLinksController.js";
const router = express.Router();

router.route("/add").post(authMiddleware, socialLinks.addLinks);
router
  .route("/remove/:platform")
  .post(authMiddleware, socialLinks.removeLink);
router.route("/update").post(authMiddleware, socialLinks.updateLink);
router.route("/:username").get(socialLinks.getLinks);

export default router;
