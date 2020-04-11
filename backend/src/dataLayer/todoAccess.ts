import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk';
import { TodoItem } from '../models/TodoItem'

import { createLogger } from '../utils/logger'
import { TodoUpdate } from '../models/TodoUpdate'
const logger = createLogger('createTodo')

const XAWS = AWSXRay.captureAWS(AWS);

const s3 = new AWS.S3({
  signatureVersion: 'v4',
});

export class TodoAccess {
  private readonly docClient = new XAWS.DynamoDB.DocumentClient();
  private readonly todoTable = process.env.TODOS_TABLE;
  private readonly urlExpiration = process.env.SIGNED_URL_EXPIRATION;
  private readonly bucketName = process.env.IMAGES_S3_BUCKET;


  async createTodo(todo: TodoItem): Promise<TodoItem> {
    logger.info('CREATE_TODO', todo);

    await this.docClient.put({
      TableName: this.todoTable,
      Item: <any>todo,
    }).promise();

    return todo;
  }

  async deleteTodo (userId: string, todoId: string): Promise<void> {
    logger.info('DELETE_TODO', {
      userId,
      todoId,
    });
    await this.docClient.delete({
      TableName: this.todoTable,
      Key: {
        userId,
        todoId,
      }
    }).promise();
  }

  async generateUploadUrl (userId: string, todoId: string, imageId: string): Promise<string> {
    logger.info('GENERATE_UPLOAD_URL', {
      userId,
      todoId,
      imageId,
    });
    const uploadUrl = await s3.getSignedUrl(
      'putObject',
      {
        Bucket: this.bucketName,
        Key: imageId,
        Expires: this.urlExpiration,
      }
    )

    await this.docClient.update({
      TableName: this.todoTable,
      Key: { userId, todoId },
      AttributeUpdates: {
        attachmentUrl: {
          Action: 'PUT',
          Value: `https://${this.bucketName}.s3.amazonaws.com/${imageId}`,
        },
      }
    }).promise();

    return uploadUrl;
  }


  async getTodos (userId: string): Promise<TodoItem[]> {
    logger.info('GET_TODOS', {
      userId,
    });

    const result = await this.docClient.query({
      TableName: this.todoTable,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId,
      }
    }).promise();


    const items = result.Items

    return items;
  }

  async updateTodos (userId: string, todoId: string, todo: TodoUpdate): Promise<void> {
    logger.info('UPDATE_TODO', {
      userId,
      todoId,
      todo,
    });

    await this.docClient.update({
      TableName: this.todoTable,
      Key: { userId, todoId },
      AttributeUpdates: {
        name: {
          Action: 'PUT',
          Value: todo.name,
        },
        dueDate: {
          Action: 'PUT',
          Value: todo.dueDate,
        },
        done: {
          Action: 'PUT',
          Value: todo.done,
        },
      }
    }).promise();

  }


}


