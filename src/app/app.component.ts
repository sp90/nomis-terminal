import { NgIf, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  PLATFORM_ID,
  effect,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Post } from 'posts.const';
import { CommandsState } from './commands.state';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NgIf],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  private platformId = inject(PLATFORM_ID);
  private cmdState = inject(CommandsState);
  private historyIndex: number | null = null;

  post = input.required<Post>();
  textareaEl = viewChild.required<ElementRef<HTMLTextAreaElement>>('textareaEl');
  preEl = viewChild.required<ElementRef<HTMLPreElement>>('preEl');

  cmdValue = signal('');
  statusStr = this.cmdState.statusStr;
  cmdHistory = this.cmdState.cmdHistory.asReadonly();
  cmdIsLoading = this.cmdState.cmdIsLoading.asReadonly();

  constructor() {
    effect(() => {
      const contentStream = this.cmdState.contentStream();

      this.preEl().nativeElement.innerHTML = contentStream;

      if (isPlatformBrowser(this.platformId)) {
        this.textareaEl().nativeElement.focus();
        this.onScroll(new Event('scroll'));
      }
    });
  }

  @HostListener('window:scroll', ['$event'])
  onScroll(_: Event) {
    const nonLoadedImages = document.querySelectorAll<HTMLImageElement>('img[data-src]');

    nonLoadedImages.forEach(img => {
      const rect = img.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom >= 0) {
        const dataSrc = img.getAttribute('data-src') as string;

        img.setAttribute('src', dataSrc);
        img.removeAttribute('data-src');
      }
    });
  }

  @HostListener('window:keydown', ['$event'])
  keyDown($event: KeyboardEvent) {
    const notIncluding: string[] = [];

    if (notIncluding.includes($event.key)) {
      return;
    }

    this.textareaEl().nativeElement.focus();
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.textareaEl().nativeElement.focus();
    }
  }

  historyCmd($event: Event, dir: 'prev' | 'next') {
    $event.preventDefault();

    const history = this.cmdHistory();

    if (this.historyIndex === null) {
      this.historyIndex = history.length;
    }

    const historyIndex = dir === 'prev' ? this.historyIndex - 1 : this.historyIndex + 1;

    if (historyIndex === history.length) {
      this.cmdValue.set('');
      this.historyIndex = null;
      return;
    }

    if (historyIndex < 0 || historyIndex > history.length - 1) {
      return;
    }

    this.historyIndex = historyIndex;
    this.cmdValue.set(history[historyIndex]);
  }

  submitCmd($event: Event) {
    $event.preventDefault();

    this.cmdState.runCmd(this.cmdValue()).subscribe();
    this.cmdValue.set('');
  }
}
