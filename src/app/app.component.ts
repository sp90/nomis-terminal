import { NgIf } from '@angular/common';
import {
  Component,
  ElementRef,
  HostListener,
  Input,
  OnInit,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Post } from 'posts.const';
import { CommandsState } from './commands.state';
import { PostsState } from './posts.state';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NgIf],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  private cmdState = inject(CommandsState);
  private postsState = inject(PostsState);
  private historyIndex: number | null = null;

  @Input() post!: Post;
  @ViewChild('textarea') textareaEl!: ElementRef<HTMLTextAreaElement>;
  @ViewChild('textarea') set textarea(ref: ElementRef<HTMLTextAreaElement>) {
    if (!!ref) {
      ref.nativeElement.focus();
    }
  }

  cmdValue = signal('');
  statusStr = this.cmdState.statusStr;
  cmdHistory = this.cmdState.cmdHistory.asReadonly();
  cmdIsLoading = this.cmdState.cmdIsLoading.asReadonly();
  contentStream = this.cmdState.contentStream.asReadonly();

  @HostListener('window:mouseup', ['$event'])
  mouseUp(_: MouseEvent) {
    const selection = (window as any)?.getSelection()?.toString();

    if (!selection || selection.length === 0) {
      this.textareaEl.nativeElement.focus();
    }
  }

  ngOnInit(): void {
    this.postsState.loadPosts();
    this.cmdState.runCmd('help init', true).subscribe();
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
