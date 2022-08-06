const aws = require("aws-sdk");

const multer = require("multer"); // For file uploads
const path = require("path");
const crypto = require("crypto");
const multerS3 = require("multer-s3");

const storageTypes = {
  local: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.resolve(__dirname, "..", "..", "tmp", "uploads"));
    },
    filename: (req, file, cb) => {
      crypto.randomBytes(16, (err, hash) => {
        if (err) cb(err);

        file.key = `${hash.toString("hex")}-${file.originalname}`;

        cb(null, file.key);
      });
    },
  }),
  s3: multerS3({
    s3: new aws.S3({}),
    bucket: process.env.BUCKET_NAME, // Bucket name on AWS S3 service (e.g. "my-bucket")
    contentType: multerS3.AUTO_CONTENT_TYPE, // Automatically set the file's content type. Defaults to octet-stream. Use false to disable. Defaults to true.
    acl: "public-read", // ACL for the object. Defaults to "public-read". Can be "public", "private", or "public-read".
    key: (req, file, cb) => {
      // Callback function that will be passed the object key name and the original request.  You can use these to generate a unique filename for the object.
      crypto.randomBytes(16, (err, hash) => {
        if (err) cb(err);

        const fileName = `${hash.toString("hex")}-${file.originalname}`;

        cb(null, fileName);
      });
    },
  }),
};

module.exports = {
  dest: path.resolve(__dirname, "..", "..", "tmp", "uploads"),
  storage: storageTypes[process.env.STORAGE_TYPE],
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      "image/jpeg",
      "image/pjpeg",
      "image/png",
      "image/gif",
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type."));
    }
  },
};
