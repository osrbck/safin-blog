const fs = require('fs/promises');
const path = require('path');
const { randomUUID } = require('crypto');
const HttpError = require('./httpError');
const { IMAGE_MIME_TYPES } = require('./constants');

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');

const EXT_BY_MIME = { 'image/png': '.png', 'image/jpeg': '.jpg', 'image/webp': '.webp' };

/** Validates an express-fileupload file and stores it under a random name. Returns the stored file name. */
const saveImage = async (file, maxBytes, label = 'Image') => {
  if (!file || Array.isArray(file)) throw new HttpError(`Please choose a single ${label.toLowerCase()}.`, 422);
  if (!IMAGE_MIME_TYPES.includes(file.mimetype)) {
    throw new HttpError(`${label} must be a PNG, JPEG or WebP file.`, 422);
  }
  if (file.size > maxBytes) {
    throw new HttpError(`${label} is too large. Maximum size is ${(maxBytes / (1024 * 1024)).toFixed(1)} MB.`, 422);
  }
  const fileName = `${randomUUID()}${EXT_BY_MIME[file.mimetype]}`;
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  await file.mv(path.join(UPLOAD_DIR, fileName));
  return fileName;
};

/** Removes a stored file; missing files are ignored. */
const removeImage = async (fileName) => {
  if (!fileName) return;
  const target = path.join(UPLOAD_DIR, path.basename(fileName));
  await fs.unlink(target).catch(() => {});
};

module.exports = { UPLOAD_DIR, saveImage, removeImage };
