import 'source-map-support/register'
import uuid from 'uuid';
import * as AWS from 'aws-sdk';
import * as AWSXRay from 'aws-xray-sdk';

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { getUserId } from '../utils'

const XAWS = AWSXRay.captureAWS(AWS);
const docClient = new XAWS.DynamoDB.DocumentClient();
const todoTable = process.env.TODOS_TABLE;

import { createLogger } from '../../utils/logger'
const logger = createLogger('createTodo')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const newTodo: CreateTodoRequest = JSON.parse(event.body)

  const userId = getUserId(event);
  const todoId = uuid.v4();


  const item = {
    todoId,
    userId,
    ...newTodo,
  };

  logger.info('CREATE_TODO', {
    userId,
    todoId,
    newTodo,
  });

  await docClient.put({
    TableName: todoTable,
    Item: item,
  }).promise();

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      // 'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify({
      item
    })
  }
}
