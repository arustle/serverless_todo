import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { TodoAccess } from '../dataLayer/todoAccess'
import { TodoItem } from '../models/TodoItem'

import uuid from 'uuid';
import { TodoUpdate } from '../models/TodoUpdate'

const todoAccess = new TodoAccess();

export async function createTodo (userId: string, newTodo: CreateTodoRequest): Promise<TodoItem> {
  const todoId = uuid.v4();
  const item: TodoItem = {
    todoId,
    userId,
    name: newTodo.name,
    dueDate: newTodo.dueDate,
    createdAt: new Date().toString(),
    done: false,
  };

  return await todoAccess.createTodo(item);
}


export async function deleteTodo (userId: string, todoId: string): Promise<void> {
  await todoAccess.deleteTodo(userId, todoId);
}

export async function generateUploadUrl (userId: string, todoId: string): Promise<string> {
  const imageId = uuid.v4();
  return await todoAccess.generateUploadUrl(userId, todoId, imageId);
}

export async function getTodos (userId: string): Promise<TodoItem[]> {
  return await todoAccess.getTodos(userId);
}

export async function updateTodo (userId: string, todoId: string, todo: TodoUpdate): Promise<void> {
  await todoAccess.updateTodos(userId, todoId, todo);
}