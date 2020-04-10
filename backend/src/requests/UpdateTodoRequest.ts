/**
 * Fields in a request to update a single TO-DO item.
 */
export interface UpdateTodoRequest {
  name: string
  dueDate: string
  done: boolean
}