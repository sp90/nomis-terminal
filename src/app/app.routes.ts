import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { CommandsState } from './commands.state';
import { PostsState } from './posts.state';

export const routes: Routes = [
  {
    path: '',
    component: AppComponent,
    resolve: {
      post: () => {
        inject(PostsState).loadPosts();

        return inject(CommandsState).runCmd('help');
      },
    },
  },
  {
    path: ':slug',
    component: AppComponent,
    resolve: {
      post: (route: ActivatedRouteSnapshot) => {
        inject(PostsState).loadPosts();

        return inject(CommandsState).runCmd(`read ${route.params['slug']}`);
      },
    },
  },
];
