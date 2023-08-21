import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { CommandsState } from './commands.state';

const fb = new FormBuilder();

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ReactiveFormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  @ViewChild('textarea') textarea!: HTMLTextAreaElement;

  cmdField = fb.control('');
  statusStr = this.cmdState.statusStr;
  cmdHistory = this.cmdState.cmdHistory.asReadonly();
  contentStream = this.cmdState.contentStream.asReadonly();

  constructor(private cmdState: CommandsState) {}

  ngOnInit(): void {
    this.textarea?.focus();
    this.cmdState.runCmd('help');
  }

  submitCmd($event: Event) {
    $event.preventDefault();

    this.cmdState.runCmd(this.cmdField.value as string);
    this.cmdField.setValue('');
  }
}
