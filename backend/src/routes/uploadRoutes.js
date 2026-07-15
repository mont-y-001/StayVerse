const express = require('express');
const multer = require('multer');
const { cloudinary, isConfigured } = require('../config/cloudinary');
const { protect, ownerOnly } = require('../middleware/authMiddleware');

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 6 },
  fileFilter: (_req, file, callback) => {
    callback(null, /^image\/(jpeg|png|webp|gif)$/.test(file.mimetype));
  },
});

function uploadToCloudinary(file) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'stayverse/properties', resource_type: 'image' },
      (error, result) => error ? reject(error) : resolve(result.secure_url)
    );
    stream.end(file.buffer);
  });
}

router.post('/', protect, ownerOnly, upload.array('images', 6), async (req, res, next) => {
  try {
    if (!isConfigured()) {
      return res.status(503).json({ message: 'Image uploads are not configured on the server.' });
    }
    if (!req.files?.length) {
      return res.status(400).json({ message: 'Choose at least one image file.' });
    }

    const imageurls = await Promise.all(req.files.map(uploadToCloudinary));
    res.status(201).json({ imageurls });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
