import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest';
import { updateTodo } from '../../businessLogic/todos'
import { getUserId } from '../utils'


export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const userId = getUserId(event);
  const todoId = event.pathParameters.todoId
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)


  await updateTodo(userId, todoId, updatedTodo);

  return {
    statusCode: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      // 'Access-Control-Allow-Credentials': true,
    },
    body: null,
  }

}
