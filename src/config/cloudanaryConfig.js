import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

cloudinary.config({
  cloud_name:  process.env.CLOUDNAME,
  api_key:     process.env.CLOUD_APIKEY,
  api_secret:  process.env.CLOUD_APISECRET,
});

export const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder:          'Chat_App',
    allowed_formats: ['png', 'jpg', 'jpeg', 'webp'],  // fixed spelling
    resource_type:   'image',
  },
});

export { cloudinary };