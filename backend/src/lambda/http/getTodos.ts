import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk';
import { getUserId } from '../utils'

import { createLogger } from '../../utils/logger'
const logger = createLogger('getTodo')

const XAWS = AWSXRay.captureAWS(AWS);
const docClient = new XAWS.DynamoDB.DocumentClient();
const todoTable = process.env.TODOS_TABLE;

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const userId = getUserId(event);


  logger.info('GET_TODOS', {
    userId,
  });

  const result = await docClient.query({
    TableName: todoTable,
    KeyConditionExpression: 'userId = :userId',
    ExpressionAttributeValues: {
      ':userId': userId,
    }
  }).promise();


  const items = result.Items

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      // 'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify({
      items,
    })
  }
}
