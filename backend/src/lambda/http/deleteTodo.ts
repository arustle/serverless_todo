import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk';
import { getUserId } from '../utils'

import { createLogger } from '../../utils/logger'
const logger = createLogger('deleteTodo')

const XAWS = AWSXRay.captureAWS(AWS);
const docClient = new XAWS.DynamoDB.DocumentClient();
const todoTable = process.env.TODOS_TABLE;

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId

  const userId = getUserId(event);

  logger.info('DELETE_TODO', {
    userId,
    todoId,
  });
  await docClient.delete({
    TableName: todoTable,
    Key: {
      userId,
      todoId,
    }
  }).promise();

  return {
    statusCode: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      // 'Access-Control-Allow-Credentials': true,
    },
    body: null,
  }
}
