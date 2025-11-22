import { Pipe, PipeTransform } from '@angular/core';
import {ReplyError} from '../models/command.models';

@Pipe({
  name: 'asReplyError'
})
export class AsReplyErrorPipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): ReplyError {
    return value as ReplyError;
  }

}
