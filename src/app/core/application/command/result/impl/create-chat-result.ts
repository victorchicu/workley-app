import {Result} from '../result';
import {Prompt} from '../../../../../features/resume/component/prompt-form/prompt-input/prompt-input.component';

export interface CreateChatResult extends Result {
  chatId: string;
  prompt: Prompt;
}
