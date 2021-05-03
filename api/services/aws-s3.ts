import AWS, { S3 } from 'aws-sdk';
import md5 from 'md5';
import stream from 'stream';
import { environment } from '@config/environment';
export const s3 = new AWS.S3(environment.aws.s3);

export const getObject = (params: S3.GetObjectRequest): Promise<S3.GetObjectOutput> => s3.getObject(params).promise();

export const createBucket = (params: S3.CreateBucketRequest): Promise<S3.CreateBucketOutput> => {
  return s3.createBucket(params).promise();
};

export const getSignedDownload = (params: { Bucket: string; Key: string; Expires?: number }) => {
  return s3.getSignedUrlPromise('getObject', params);
};

export const s3UploadStream = (
  params: S3.PutObjectRequest,
  func?: (err: AWS.AWSError, data: S3.PutObjectOutput) => void
) => {
  const pass = new stream.PassThrough();
  s3.putObject({ ...params, Body: pass }, func);
  return pass;
};

export const s3PutObject = (
  params: S3.PutObjectRequest,
  func?: (err: AWS.AWSError, data: S3.PutObjectOutput) => void
) => s3.putObject(params, func);

interface TagBucketInterface {
  tags: S3.TagSet;
  bucketName: S3.BucketName;
}
export const tagBucket = (params: TagBucketInterface) => {
  return s3
    .putBucketTagging({
      Bucket: params.bucketName,
      ContentMD5: md5(JSON.stringify(params.tags), { encoding: 'base64' }),
      Tagging: { TagSet: params.tags },
    })
    .promise();
};
