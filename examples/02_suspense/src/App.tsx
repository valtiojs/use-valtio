/// <reference types="react/experimental" />

import React, { Suspense, use, useTransition } from 'react';

import { proxy } from 'valtio/vanilla';
import { useValtio } from 'use-valtio';

const fetchPostData = async (id: number) => {
  const res = await fetch(`https://jsonplaceholder.typicode.com/posts/${id}`);
  const data = await res.json();
  return data as {
    id: number;
    title: string;
    body: string;
  };
};

const postState = proxy({
  post: fetchPostData(1),
});

const Post = () => {
  // FIXME how can we avoid type assertion?
  const post = use(useValtio(postState, ['post'] as ['post']));
  return (
    <ul>
      <li>ID: {post.id}</li>
      <li>Title: {post.title}</li>
      <li>Body: {post.body}</li>
    </ul>
  );
};

const App = () => {
  const [isPending, startTransition] = useTransition();
  const fetchPost = (id: number) => {
    startTransition(() => {
      postState.post = fetchPostData(id);
    });
  };
  return (
    <div>
      <button type="button" onClick={() => fetchPost(1)}>
        Fetch post 1
      </button>
      <button type="button" onClick={() => fetchPost(2)}>
        Fetch post 2
      </button>
      <button type="button" onClick={() => fetchPost(3)}>
        Fetch post 3
      </button>
      <button type="button" onClick={() => fetchPost(4)}>
        Fetch post 4
      </button>
      {isPending && <div>Pending...</div>}
      <hr />
      <Suspense fallback="Loading...">
        <Post />
      </Suspense>
    </div>
  );
};

export default App;
