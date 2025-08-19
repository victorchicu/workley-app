import {Component, computed, inject, Signal} from '@angular/core';
import {FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HeadlineComponent} from './ui/components/headline/headline.component';
import {InputComponent} from './ui/components/input/input.component';
import {PromptFacade} from './prompt.facade';
import {
  SubmitComponent
} from './ui/components/submit/submit.component';
import {UploadFileComponent} from './ui/components/upload-file/upload-file.component';
import {Router} from '@angular/router';

@Component({
  selector: 'app-resume-prompt',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    HeadlineComponent,
    InputComponent,
    SubmitComponent,
    UploadFileComponent,
  ],
  templateUrl: './prompt.component.html',
  styleUrl: './prompt.component.css',
})
export class PromptComponent {
  readonly facade: PromptFacade = inject(PromptFacade);
  readonly router: Router = inject(Router);

  vm = computed(() => ({
    form: this.facade.form,
    filename: this.facade.filename(),
    hasLineBreaks: this.facade.hasLineBreaks(),
    loading: this.facade.loading(),
    error: this.facade.error()
  }));

  onSubmit() {
    this.facade.createChat().subscribe({
      next: res => {
        this.facade.reset();
        if (res?.chatId)
          this.router.navigate(['/chat', res.chatId], {state: res})
            .then();
      },
      error: () => this.router.navigate(['/error'])
    });
  }

  onHasLineBreaks(v: boolean) { this.facade.setHasLineBreaks(v); }
}
