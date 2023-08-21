import { Injectable, signal } from '@angular/core';

type KeyValuePair = { [key: string]: Function };

// <b>cd</b>      change directory
const helpText = `
  <b>read</b>    read a blog post
  <b>ls</b>      List blog posts

  <b class="gr">help</b>    Print this help menu`;

// Create sub help commands for each command
const CMD_TREE = {
  // cd: (_: string, dir: string) => {
  //   // Preload all blog posts
  //   // Figure out if if it exists as blog post

  //   if (false) {
  //     return 'cd: not a directory: ' + dir;
  //   }

  //   return 'cd: no such file or directory: ' + dir;
  // },
  ls: () => {
    // Preload all blog posts
    // Show a list of blog post slugs
  },
  empty: () => '',
  cmdNotFound: (cmd: string) => 'command not found: ' + cmd,
  help: () => helpText
};

@Injectable({
  providedIn: 'root'
})
export class CommandsState {
  statusStr = '<b class="t">Nomis</b> via 🅰️ <b class="r">v16.2.1</b>';
  cmdHistory = signal<string[]>([]);
  contentStream = signal<string>('');

  runCmd(cmdString: string, noHistory = false) {
    if (noHistory === false) {
      this.cmdHistory.set([...this.cmdHistory(), cmdString]);
    }

    const cmdSplit = cmdString.split(' ');
    const cmd = cmdSplit[0];
    const cmdFn =
      cmd === '' ? CMD_TREE['empty'] : (CMD_TREE as KeyValuePair)[cmd] || CMD_TREE['cmdNotFound'];
    const result = cmdFn(cmdString, ...cmdSplit.splice(1));

    this.addNewContent(result, cmd === 'help' ? undefined : cmdString);

    return result;
  }

  private addNewContent(content: string, cmdString?: string) {
    const currentContent = this.contentStream();
    let contentStr = '';

    if (currentContent === '') {
      contentStr += this.statusStr + '\n';

      if (cmdString) {
        contentStr += cmdString + '\n';
      }

      contentStr += content + '\n\n';

      this.contentStream.set(contentStr);
      return;
    }

    contentStr += currentContent + '\n';
    contentStr += this.statusStr + '\n';

    if (cmdString) {
      contentStr += '<b class="r">❯</b> ' + cmdString + '\n';
    }

    contentStr += content + '\n\n';

    this.contentStream.set(contentStr);
  }
}
