import {Task} from './task';

export interface ProcessingTask extends Task {
  message: string;
}
