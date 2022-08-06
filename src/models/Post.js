const mongoose = require("mongoose");
const aws = require("aws-sdk");
const fs = require("fs"); // Utiliza o filesystem para ler e escrever arquivos no sistema de arquivos do computador (em vez de usar o S3)
const path = require("path"); // Navega pelas pastas do sistema de arquivos do computador (em vez de usar o S3)
const { promisify } = require("util"); // Converte uma funcao que utiliza callbacks para uma funcao que utiliza promessas

const s3 = new aws.S3(); // Create an S3 client

const PostSchema = new mongoose.Schema({
  name: String, // String is shorthand for {type: String}
  size: Number, // Number is shorthand for {type: Number}
  key: String,
  url: String,
  createdAt: {
    type: Date, // Date is shorthand for {type: Date, default: Date.now}
    default: Date.now, // Date.now is shorthand for new Date()
  },
});

PostSchema.pre("save", function () {
  // Pre is a Mongoose middleware function that runs before the save() method is called.
  if (!this.url) {
    // If there is no url field...
    this.url = `${process.env.APP_URL}/files/${this.key}`; // Set the url field to the file's url in the storage
  }
});

PostSchema.pre("remove", function () {
  if (process.env.STORAGE_TYPE === "s3") {
    return s3
      .deleteObject({
        Bucket: process.env.BUCKET_NAME, // Bucket name on AWS S3 service (e.g. "my-bucket")
        Key: this.key, // The key of the object to delete (e.g. "my-image.png")
      })
      .promise(); // Delete the object from the bucket on AWS S3 service (e.g. "my-bucket/my-key")
    // Promise foi utilizada que somente após o arquivo na s3 seja deletado, o post será deletado do banco de dados.
  } else {
    return promisify(fs.unlink)(
      path.resolve(__dirname, "..", "..", "tmp", "uploads", this.key)
    ); // Delete the object from the filesystem (e.g. "tmp/uploads/my-key")
  }
});

module.exports = mongoose.model("Post", PostSchema); // Export the model so it can be used elsewhere.

// The model is used to create documents.
// The documents are used to access the data in the database.
// The documents are used to update the data in the database.
// The documents are used to delete the data in the database.
// The documents are used to create the data in the database.
