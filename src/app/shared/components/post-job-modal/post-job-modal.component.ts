import {Component, computed, inject, signal, output, OnInit, DestroyRef, PLATFORM_ID} from '@angular/core';
import {isPlatformBrowser} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Router} from '@angular/router';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {Subject, debounceTime, distinctUntilChanged, switchMap, of} from 'rxjs';
import {JobApiService} from '../../services/job-api.service';
import {JobDraft} from '../../services/job-api.models';
import {ChatApiService} from '../../chat-api/chat-api.service';
import {AuthService} from '../../services/auth.service';
import {HttpErrorResponse} from '@angular/common/http';

type Step = 'title' | 'tags' | 'description';

const TAG_SUGGESTIONS = [
  'Remote', 'On-site', 'Hybrid', 'Anywhere',
  'Moldova', 'Romania', 'Germany', 'USA', 'UK', 'Netherlands', 'Poland'
];

const STORAGE_KEY = 'job_draft';

@Component({
  selector: 'app-post-job-modal',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './post-job-modal.component.html',
})
export class PostJobModalComponent implements OnInit {
  private readonly jobApi = inject(JobApiService);
  private readonly chatApi = inject(ChatApiService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);
  private readonly titleInput$ = new Subject<string>();

  readonly close = output<void>();

  protected readonly step = signal<Step>('title');
  protected readonly title = signal('');
  protected readonly titleHints = signal<string[]>([]);
  protected readonly showHints = signal(false);
  protected readonly tags = signal<string[]>([]);
  protected readonly tagInput = signal('');
  protected readonly description = signal('');
  protected readonly draftChatId = signal<string | null>(null);
  protected readonly isLoading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly suggestions = TAG_SUGGESTIONS;

  protected readonly isTitleValid = computed(() => this.title().trim().length > 0);
  protected readonly hasTagsValid = computed(() => this.tags().length > 0);
  protected readonly isDescriptionValid = computed(() => this.description().trim().length > 0);

  ngOnInit(): void {
    this.restoreDraft();
    this.titleInput$.pipe(
      debounceTime(150),
      distinctUntilChanged(),
      switchMap(q => q.length >= 2 ? this.jobApi.getHints(q) : of([])),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: hints => {
        console.log('Title hints received:', hints);
        this.titleHints.set(hints);
        this.showHints.set(hints.length > 0);
      },
      error: err => console.error('Title hints error:', err)
    });
  }

  onTitleInput(value: string): void {
    console.log('onTitleInput:', value);
    this.title.set(value);
    this.titleInput$.next(value);
  }

  highlightMatch(hint: string): string {
    const query = this.title().trim();
    if (!query) return hint;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return hint.replace(regex, '<strong>$1</strong>');
  }

  onSelectHint(hint: string): void {
    this.title.set(hint);
    this.showHints.set(false);
  }

  onTitleBlur(): void {
    // Delay to allow click on hint to register
    setTimeout(() => this.showHints.set(false), 200);
  }

  onContinueToTags(): void {
    if (this.isTitleValid()) {
      this.showHints.set(false);
      this.step.set('tags');
    }
  }

  onContinueToDescription(): void {
    if (this.hasTagsValid()) {
      this.step.set('description');
    }
  }

  onBackToTitle(): void {
    this.step.set('title');
  }

  onBackToTags(): void {
    this.step.set('tags');
  }

  onAddTag(tag: string): void {
    const trimmed = tag.trim();
    if (trimmed && !this.tags().includes(trimmed)) {
      this.tags.update(t => [...t, trimmed]);
    }
    this.tagInput.set('');
  }

  onTagInputKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.onAddTag(this.tagInput());
    }
  }

  onRemoveTag(tag: string): void {
    this.tags.update(t => t.filter(item => item !== tag));
  }

  onSuggestionClick(suggestion: string): void {
    this.onAddTag(suggestion);
  }

  onDraftWithAi(): void {
    this.saveDraft();
    const prompt = `Help me write a job description for the position: ${this.title()}. Location/details: ${this.tags().join(', ')}. Ask me a few clarifying questions about the role (key responsibilities, required experience, team, etc.), then write a professional job description.`;

    this.chatApi.createChat(prompt).subscribe({
      next: (response) => {
        this.draftChatId.set(response.chatId);
        this.saveDraft();
        this.close.emit();
        this.router.navigate(['/chat', response.chatId]);
      },
      error: () => {
        this.error.set('Failed to start AI drafting. Please try again.');
      }
    });
  }

  onPost(): void {
    if (!this.isDescriptionValid()) return;

    if (!this.authService.isAuthenticated()) {
      this.saveDraft();
      this.close.emit();
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem('job_draft_pending_post', 'true');
      }
      return;
    }

    this.submitJob();
  }

  private submitJob(): void {
    this.error.set(null);
    this.isLoading.set(true);

    this.jobApi.createJob({
      title: this.title(),
      tags: this.tags(),
      description: this.description(),
      draftChatId: this.draftChatId() ?? undefined,
    }).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.clearDraft();
        this.close.emit();
        this.router.navigate(['/my/jobs']);
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading.set(false);
        this.error.set(err.error?.message ?? 'Failed to post job. Please try again.');
      }
    });
  }

  private saveDraft(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const draft: JobDraft = {
      title: this.title(),
      tags: this.tags(),
      description: this.description(),
      draftChatId: this.draftChatId(),
      step: this.step(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  }

  private restoreDraft(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const draft: JobDraft = JSON.parse(raw);
      this.title.set(draft.title || '');
      this.tags.set(draft.tags || []);
      this.description.set(draft.description || '');
      this.draftChatId.set(draft.draftChatId);
      this.step.set(draft.step || 'title');
    } catch {
      // Ignore corrupt data
    }
  }

  private clearDraft(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('job_draft_pending_post');
  }
}
