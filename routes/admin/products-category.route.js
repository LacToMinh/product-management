const express = require("express");
const multer = require("multer");
const router = express.Router();

const upload = multer();

const controller = require("../../controllers/admin/products-category.controller");
const validate = require("../../validation/admin/products-category.validate");
const uploadCloud = require("../../middlewares/admin/uploadCloud.middeware")

router.get("/", controller.index);

router.get("/create", controller.create);

router.post(
  "/create",
  upload.single("thumbnail"),
  uploadCloud.upload,
  validate.createPost,
  controller.createPost
);

module.exports = router;
