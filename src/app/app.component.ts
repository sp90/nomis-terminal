import { NgIf } from '@angular/common';
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { Post } from 'posts.const';
import { CommandsState } from './commands.state';
import { PostsState } from './posts.state';

const fb = new FormBuilder();

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NgIf],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  @Input() post!: Post;
  @ViewChild('textarea') textarea!: ElementRef<HTMLTextAreaElement>;

  statusStr = this.cmdState.statusStr;
  cmdHistory = this.cmdState.cmdHistory.asReadonly();
  cmdIsLoading = this.cmdState.cmdIsLoading.asReadonly();
  contentStream = this.cmdState.contentStream.asReadonly();

  constructor(private cmdState: CommandsState, private postsState: PostsState) {}

  ngOnInit(): void {
    this.textarea?.nativeElement.focus();
    this.postsState.loadPosts();
    this.cmdState.runCmd('help init');
  }

  submitCmd($event: Event) {
    $event.preventDefault();

    this.cmdState.runCmd(this.textarea.nativeElement.value);
    this.textarea.nativeElement.value = '';
  }
}
