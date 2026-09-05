import multer from "multer";
import path from "path";
import fs from "fs";

// Separate multer instance from multer.middleware.js because that one only
// allows image mimetypes (for avatars). Creator assets can be images
// (backgrounds) OR audio (BGM/SFX), so it needs a wider file filter.
const tempDir = "./public/temp";
fs.mkdirSync(tempDir, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, tempDir);
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname));
  },
});

const ALLOWED_MIME_TYPES = new Set([
  // images (backgrounds)
  "image/png",
  "image/jpeg",
  "image/webp",
  // audio (bgm / sfx)
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/x-wav",
  "audio/ogg",
  "audio/webm",
]);

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Unsupported file type. Upload PNG/JPG/WEBP images or MP3/WAV/OGG audio."), false);
  }
};

export const uploadAsset = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB, audio files run bigger than avatars
  },
});
