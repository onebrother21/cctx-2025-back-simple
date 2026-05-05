import { CorsOptions } from "cors";
import { SessionOptions } from 'express-session';
import MongoStore from 'connect-mongo';
import multer from "multer";
import path from "path";
import fs from "fs";
import {v2 as cloudinary} from "cloudinary";
import Utils from "@utils";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// MULTER & UPLOADS
const storage = multer.diskStorage({
  destination:(req,file,cb) => {
    const dir = path.join(__dirname, '../../uploads');
    cb(null,dir);
  },
  filename:(req,file,cb)=>{
    cb(null, Date.now()+'-'+file.originalname);
  }
});
const upload = multer({storage}); // temporary local storage
const uploadFields = [
  "type",
  "asset_folder",
  "original_filename",
  "original_date",
  "location",
  "description",
  "format",
  "resource_type",
  "bytes",
  "secure_url",
  "public_id",
  "created_at",
];
const uploadToCloudinary = async (req:IRequest) => {
  if(!req.file) throw "upload error, no file data present";
  const filepath = req.file.path;
  const opts = {resource_type: 'auto',folder: 'your_app_media'} as any;
  const uploadRes = await cloudinary.uploader.upload(filepath,opts);
  fs.unlinkSync(filepath);
  return uploadRes;
};

export {
  upload,
  uploadFields,
  uploadToCloudinary,
};