import {Task} from './task';

export interface AsyncTaskResponse<T extends Task> {
  taskId: string;
  result: T;
}
