import { Pipe, PipeTransform } from '@angular/core';
import {ReplyChunk} from '../models/command.models';

@Pipe({
  name: 'asReplyChunk'
})
export class AsReplyChunkPipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): ReplyChunk {
    return value as ReplyChunk;
  }

}
