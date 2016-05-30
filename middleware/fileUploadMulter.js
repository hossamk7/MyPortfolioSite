var multer = require("multer");

function fileFilter (req, file, cb) {
  // The function should call `cb` with a boolean 
  // to indicate if the file should be accepted 
  switch (file.mimetype) {
      case 'image/jpeg':
          cb(null, true);
          break;
      case 'image/png':
          cb(null, true);
          break;
      case 'image/gif':
          cb(null, true);
          break;
      default:
          cb(null, false);
  }
}

module.exports = multer({ dest: 'uploads/', fileFilter: fileFilter, limits: {fileSize: 5000000} });