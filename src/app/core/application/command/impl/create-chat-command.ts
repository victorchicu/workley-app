import {Prompt} from '../../../../features/resume/component/prompt-form/prompt-input/prompt-input.component';
import {Command} from '../command';

export class CreateChatCommand extends Command {
  readonly type = 'CreateChatCommand' as const; // defined exactly once

  constructor(public prompt: Prompt) {
    super();
  }
}
