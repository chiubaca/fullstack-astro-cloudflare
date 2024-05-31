import {
  GetObjectCommand,
  ListBucketsCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

type Body = PutObjectCommand["input"]["Body"];

export const bucketAccess = (env: Env) => {
  const client = new S3Client({
    region: "auto",
    endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: env.R2_ACCESS_ID,
      secretAccessKey: env.R2_SECRET_KEY,
    },
  });

  return {
    listBuckets: async () => {
      const command = new ListBucketsCommand({});
      const { Buckets } = await client.send(command);
      console.log("🚀 ~ addObject ~ Buckets:", Buckets);
    },

    getObject: async (key: string) => {
      const command = new GetObjectCommand({
        Bucket: "fullstack-astro-cloudflare-bucket",
        Key: key,
      });
      const { Body } = await client.send(command);
      console.log("🚀 ~ addObject ~ Body:", Body);
    },

    putObject: async (args: {
      key: string;
      body: Body;
      contentType: string;
    }) => {
      const { key, body, contentType } = args;

      const command = new PutObjectCommand({
        Bucket: "fullstack-astro-cloudflare-bucket",
        Key: key,
        Body: body,
        ContentType: contentType,
      });
      const response = await client.send(command);
      return response;
    },

    signedImageUrl: async (key: string) => {
      return await getSignedUrl(
        client,
        new GetObjectCommand({
          Bucket: "fullstack-astro-cloudflare-bucket",
          Key: key,
        }),
        { expiresIn: 3600 }
      );
    },
  };
};

// TODO: think of a better image access patterns
export const makeImageUrl = (imageRef: string) => {
  const PUBLIC_BUCKET_URL = import.meta.env.PUBLIC_BUCKET_URL;

  if (!PUBLIC_BUCKET_URL) {
    throw new Error("You have not configured your public bucket access");
  }

  return `${PUBLIC_BUCKET_URL}/${imageRef}`;
};
