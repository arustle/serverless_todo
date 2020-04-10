import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk';
import { getUserId } from '../utils'

import { createLogger } from '../../utils/logger'
const logger = createLogger('updateTodo')

const XAWS = AWSXRay.captureAWS(AWS);
const docClient = new XAWS.DynamoDB.DocumentClient();
const todoTable = process.env.TODOS_TABLE;

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const userId = getUserId(event);
  const todoId = event.pathParameters.todoId
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)

  logger.info('UPDATE_TODO', {
    userId,
    todoId,
    updatedTodo,
  });

  await docClient.update({
    TableName: todoTable,
    Key: { userId, todoId },
    AttributeUpdates: {
      name: {
        Action: 'PUT',
        Value: updatedTodo.name,
      },
      dueDate: {
        Action: 'PUT',
        Value: updatedTodo.dueDate,
      },
      done: {
        Action: 'PUT',
        Value: updatedTodo.done,
      },
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
