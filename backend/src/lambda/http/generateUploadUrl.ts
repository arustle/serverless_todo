import 'source-map-support/register'

import uuid from 'uuid';
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import * as AWS from 'aws-sdk';
import * as AWSXRay from 'aws-xray-sdk';

import { getUserId } from '../utils'

import { createLogger } from '../../utils/logger'
const logger = createLogger('generateUploadUrl')

const XAWS = AWSXRay.captureAWS(AWS);
const docClient = new XAWS.DynamoDB.DocumentClient();
const todoTable = process.env.TODOS_TABLE;

const s3 = new AWS.S3({
  signatureVersion: 'v4',
});

const urlExpiration = process.env.SIGNED_URL_EXPIRATION;
const bucketName = process.env.IMAGES_S3_BUCKET;

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  const userId = getUserId(event);

  const imageId = uuid.v4();

  logger.info('GENERATE_UPLOAD_URL', {
    userId,
    todoId,
    imageId,
  });
  const uploadUrl = await s3.getSignedUrl(
    'putObject',
    {
      Bucket: bucketName,
      Key: imageId,
      Expires: urlExpiration,
    }
  )


  await docClient.update({
    TableName: todoTable,
    Key: { userId, todoId },
    AttributeUpdates: {
      attachmentUrl: {
        Action: 'PUT',
        Value: `https://${bucketName}.s3.amazonaws.com/${imageId}`,
      },
    }
  }).promise();



  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      // 'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify({
      uploadUrl,
      bucketName,
      imageId,
      urlExpiration
    })
  };
}
