import User from "../model/userModel.js";

const addLinks = async (req, res, next) => {
  try {
    const socialLinks = req.body;

    // Validate socialLinks
    if (
      !socialLinks ||
      socialLinks.length === 0 ||
      !Array.isArray(socialLinks)
    ) {
      return res.status(400).json({ message: "Invalid data", success: false });
    }

    // Find the user by ID
    const userExists = await User.findOne({ _id: req.id });
    if (!userExists) {
      return res
        .status(404) // 404 Not Found is more appropriate for a missing user
        .json({ message: "User not found", success: false });
    }

    // Add social links to the user's socialLinks array
    socialLinks.forEach((link) => {
      const platformExists = userExists.socialLinks.some(
        (existingLink) => existingLink.platform === link.platform
      );
      if (!platformExists) {
        userExists.socialLinks.push(link);
      } else {
        return res.status(400).json({
          message: "link already included, either exclude it or make a new one",
          success: false,
        });
      }
    });

    // Save the updated user
    await userExists.save();

    // Return success response
    return res.status(200).json({
      message: "Link added successfully",
      success: true,
      data: userExists.socialLinks,
    });
  } catch (error) {
    next(error);
  }
};
const removeLink = async (req, res, next) => {
  try {
    const platform = req.params.platform.toLowerCase().trim();
    if (!platform) {
      return res
        .status(400)
        .json({ message: "Invalid platform", success: false });
    }

    const userExists = await User.findById(req.id);
    if (!userExists) {
      return res
        .status(404)
        .json({ message: "User not found", success: false });
    }

    const linkExists = userExists.socialLinks.some(
      (existingLink) => existingLink.platform === platform
    );
    if (linkExists) {
      userExists.socialLinks = userExists.socialLinks.filter(
        (link) => link.platform.toLowerCase().trim() !== platform
      );
    } else {
      return res
        .status(400)
        .json({ message: "link not found", success: false });
    }

    await userExists.save();

    return res.status(200).json({ message: "Link removed", success: true });
  } catch (error) {
    next(error);
  }
};
const getLinks = async (req, res, next) => {
  try {
    const username = req.params.username;
    if (!username.trim()) {
      return res.status(400).json({ message: "invalid data", success: false });
    }
    const userExists = await User.findOne({ username: username }).select({
      password: 0,
    });
    if (!userExists) {
      return res
        .status(404)
        .json({ message: "user not found", success: false });
    }
    return res.status(200).json({
      message: "links found",
      success: true,
      data: userExists,
    });
  } catch (error) {
    next(error);
  }
};
const updateLink = async (req, res, next) => {
  try {
    const { newPlatform, newUrl, platform } = req.body;
    if (!newPlatform.trim() || !newUrl.trim() || !platform.trim()) {
      return res.status(400).json({ message: "invalid data", success: false });
    }

    const userExists = await User.findById(req.id);
    if (!userExists) {
      return res
        .status(404)
        .json({ message: "user not found", success: false });
    }

    const linkIndex = userExists.socialLinks.findIndex(
      (link) =>
        link.platform.trim().toLowerCase() === platform.trim().toLowerCase()
    );

    if (linkIndex === -1) {
      return res
        .status(404)
        .json({ message: "link not found", success: false });
    }

    userExists.socialLinks[linkIndex].platform = newPlatform;
    userExists.socialLinks[linkIndex].url = newUrl;

    userExists.markModified("socialLinks");

    await userExists.save();

    return res.status(200).json({ message: "link updated", success: true });
  } catch (error) {
    next(error);
  }
};

export default { addLinks, removeLink, getLinks, updateLink };
