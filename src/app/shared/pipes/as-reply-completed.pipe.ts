import { Pipe, PipeTransform } from '@angular/core';
import {ReplyCompleted} from '../models/command.models';

@Pipe({
  name: 'asReplyCompleted'
})
export class AsReplyCompletedPipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): ReplyCompleted {
    return value as ReplyCompleted;
  }

}
