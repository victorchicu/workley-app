import { Pipe, PipeTransform } from '@angular/core';
import {ReplyChunk} from '../chat-api/chat-api.models';

@Pipe({
  name: 'asReplyChunk'
})
export class AsReplyChunkPipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): ReplyChunk {
    return value as ReplyChunk;
  }

}
