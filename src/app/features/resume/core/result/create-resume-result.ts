import {CreationStep} from './creation-step';
import {Result} from './result';

export interface CreateResumeResult extends Result {
  creationStep: CreationStep;
}
