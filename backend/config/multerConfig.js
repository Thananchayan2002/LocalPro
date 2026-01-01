const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Helper to create upload directory if it doesn't exist
function ensureUploadDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Factory to create multer instance for a given folder (e.g., 'slider', 'oldEvents')
function getMulterUpload(folderName) {
  const uploadDir = path.join(__dirname, "..", "uploads", folderName);
  ensureUploadDir(uploadDir);

  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(
        null,
        file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
      );
    },
  });

  return multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
      fileSize: 100 * 1024 * 1024, // 100MB max file size
    },
  });
}

// File filter
const fileFilter = (req, file, cb) => {
  const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
  const allowedVideoTypes = /mp4|mov|avi|mkv|webm/;

  const extname = path.extname(file.originalname).toLowerCase();
  const mimetype = file.mimetype;

  if (
    mimetype.startsWith("image/") &&
    allowedImageTypes.test(extname.slice(1))
  ) {
    cb(null, true);
  } else if (
    mimetype.startsWith("video/") &&
    allowedVideoTypes.test(extname.slice(1))
  ) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only images (JPEG, JPG, PNG, GIF, WEBP) and videos (MP4, MOV, AVI, MKV, WEBM) are allowed."
      ),
      false
    );
  }
};

// Default export for slider (backward compatibility)
const sliderUpload = getMulterUpload('slider');
module.exports = sliderUpload;
module.exports.getMulterUpload = getMulterUpload;
