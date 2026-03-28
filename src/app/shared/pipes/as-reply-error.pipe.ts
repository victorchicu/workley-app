import { Pipe, PipeTransform } from '@angular/core';
import {ReplyError} from '../chat-api/chat-api.models';

@Pipe({
  name: 'asReplyError'
})
export class AsReplyErrorPipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): ReplyError {
    return value as ReplyError;
  }

}
