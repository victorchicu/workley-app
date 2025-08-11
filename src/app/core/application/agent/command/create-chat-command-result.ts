import {Prompt} from '../../../../features/resume/component/prompt-form/prompt-input/prompt-input.component';
import {CommandResult} from './command-result';

export interface CreateChatCommandResult extends CommandResult {
  chatId: string;
  prompt: Prompt;
}
