import multer from "multer";
import path from "path";
import fs from "fs";

// Define the storage for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const username = req.username;
    if (!username) {
      new Error("username not found");
    }
    const dir = `uploads/${username}/profile`;

    // remove dir if already exists
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
    }

    // recreate directory
    fs.mkdirSync(dir, { recursive: true });

    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `profile${ext}`);
  },
});

// Initialize multer with the defined storage
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Accept only image files
    const allowedTypes = /jpeg|jpg|png|gif|avif|webp/;
    const ext = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimeType = allowedTypes.test(file.mimetype);

    if (ext && mimeType) {
      cb(null, true);
    } else {
      cb(new Error("Only images are allowed!"));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
});

export default upload;
