import { S3Client } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
dotenv.config();

const region = process.env.AWS_REGION || 'ap-south-1';
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const bucketName = process.env.AWS_S3_BUCKET_NAME || process.env.AWS_S3_BUCKET || 'ecohub-waste-images-2026-sanjith';

let s3Client = null;

if (accessKeyId && secretAccessKey) {
  s3Client = new S3Client({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
  console.log(`[AWS S3] Configured successfully for region '${region}' and bucket '${bucketName}'`);
} else {
  console.log(`[AWS S3] Notice: AWS credentials not provided in environment. AWS S3 integration initialized in fallback mode.`);
}

export { s3Client, bucketName, region };
