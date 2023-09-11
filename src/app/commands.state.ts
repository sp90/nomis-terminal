import { Injectable, VERSION, inject, signal } from '@angular/core';
import { Observable, catchError, finalize, map, of } from 'rxjs';
import { PostsState } from './posts.state';

type KeyValuePair = { [key: string]: Function };

// <b>cd</b>      change directory
const helpText = `
  <b>read</b>    Read a blog post
  <b>ls</b>      List blog posts

  <b>x</b>       Open 𝕏 profile
  <b>gh</b>      Open Github profile

  <b class="gr">help</b>    Print this help menu`;

@Injectable({
  providedIn: 'root'
})
export class CommandsState {
  postsState = inject(PostsState);
  statusStr = '<b class="t">Nomis</b> via 🅰️ <b class="r">v' + VERSION.full + '</b>';
  cmdIsLoading = signal<boolean>(false);
  cmdHistory = signal<string[]>([]);
  contentStream = signal<string>('');
  CMD_TREE = {
    // cd: (_: string, dir: string) => {
    //   // Preload all blog posts
    //   // Figure out if if it exists as blog post

    //   if (false) {
    //     return 'cd: not a directory: ' + dir;
    //   }

    //   return 'cd: no such file or directory: ' + dir;
    // },
    read: (_: string, id: string) => {
      const _id = parseInt(id);

      if (id === 'help' || id?.length === 0 || !id || isNaN(_id)) {
        return this.CMD_TREE.readHelp();
      }

      return this.postsState.getPost(_id).pipe(
        map((res) => res?.c),
        catchError((_) => of('read: no such file or directory: ' + id))
      );
    },
    readHelp: () => {
      return `read [ID] - Read a blog post by parsing id of blog post found in <b class="r">ls</b>`;
    },
    ls: () => {
      // Preload all blog posts
      // Show a list of blog post slugs
      const posts = this.postsState.posts();
      let postStr = '';

      if (posts.length > 0) {
        postStr += '\nBlog posts:\n';
        postStr += '  ID  -  Slug\n';
      }

      // TODO fix pad left for numbers > 9 && 99
      for (let index = 0; index < posts.length; index++) {
        postStr += `  ${posts[index].i}  -  ${posts[index].s}`;

        if (index !== posts.length - 1) {
          postStr += '\n';
        }
      }

      return postStr;
    },
    x: () => {
      window.open('https://x.com/SimonBitwise', '_blank');
      return 'Hello, 𝕏!';
    },
    gh: () => {
      window.open('https://github.com/sp90', '_blank');
      return 'Hello, Github!';
    },
    cmdNotFound: (cmd: string) => 'command not found: ' + cmd,
    help: () => helpText
  };

  runCmd(cmdString: string, noHistory = false) {
    if (noHistory === false) {
      this.cmdHistory.set([...this.cmdHistory(), cmdString]);
    }

    const cmdSplit = cmdString.split(' ');
    const cmd = cmdSplit[0];
    const cmdFn =
      cmd === '' ? () => {} : (this.CMD_TREE as KeyValuePair)[cmd] || this.CMD_TREE['cmdNotFound'];

    const result = cmdFn(cmdString, ...cmdSplit.splice(1));

    if (result instanceof Observable) {
      this.cmdIsLoading.set(true);

      return result
        .pipe(finalize(() => this.cmdIsLoading.set(false)))
        .subscribe((res: any) => this.addNewContent(res, cmdString));
    }

    this.addNewContent(result, cmd === 'help' ? undefined : cmdString);

    return result;
  }

  private addNewContent(content: string, cmdString?: string) {
    console.log('content: ', content);

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
