import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { CommandsState } from './commands.state';

export const routes: Routes = [
  {
    path: ':slug',
    component: AppComponent,
    providers: [CommandsState],
    resolve: {
      post: (route: ActivatedRouteSnapshot) => {
        // console.log("route.params['slug']: ", route.params['slug']);
        console.log('hello: ');

        return inject(CommandsState).runCmd('read ' + route.params['slug']);

        // return 'hello';
      },
    },
  },
];
