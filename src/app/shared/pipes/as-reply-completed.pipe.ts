import { Pipe, PipeTransform } from '@angular/core';
import {ReplyCompleted} from '../chat-api/chat-api.models';

@Pipe({
  name: 'asReplyCompleted'
})
export class AsReplyCompletedPipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): ReplyCompleted {
    return value as ReplyCompleted;
  }

}
