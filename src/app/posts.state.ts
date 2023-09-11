import { isPlatformServer } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { POSTS, POSTS_LIST, Post, PostPreview } from 'posts.const';
import { of, take, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PostsState {
  private BASE_PATH = '/api/posts';

  posts = signal<PostPreview[]>([]);

  constructor(private http: HttpClient, @Inject(PLATFORM_ID) private platformId: Object) {}

  loadPosts() {
    if (isPlatformServer(this.platformId)) {
      this.posts.set(POSTS_LIST);
      return;
    }

    this.http
      .get<PostPreview[]>(this.BASE_PATH)
      .pipe(tap((res) => this.posts.set(res)))
      .subscribe();
  }

  getPost(i: number) {
    if (isPlatformServer(this.platformId)) {
      const post = POSTS.find((p) => p.i === i);
      return of(post || null);
    }

    return this.http.get<Post>(`${this.BASE_PATH}/${i}`).pipe(take(1));
  }
}
