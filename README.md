# use-valtio

[![CI](https://img.shields.io/github/actions/workflow/status/dai-shi/use-valtio/ci.yml?branch=main)](https://github.com/dai-shi/use-valtio/actions?query=workflow%3ACI)
[![npm](https://img.shields.io/npm/v/use-valtio)](https://www.npmjs.com/package/use-valtio)
[![size](https://img.shields.io/bundlephobia/minzip/use-valtio)](https://bundlephobia.com/result?p=use-valtio)
[![discord](https://img.shields.io/discord/627656437971288081)](https://discord.gg/MrQdmzd)

Another custom hook to use [Valtio](https://github.com/pmndrs/valtio) proxy state

## Install

```bash
npm install valtio use-valtio
```

## Usage

```jsx
import { proxy } from 'valtio/vanilla';
import { useValtio } from 'use-valtio';

const state = proxy({ count });

const Counter = () => {
  const { count } = useValtio(state);
  const inc = () => ++state.count;
  return (
    <div>
      {count} <button onClick={inc}>+1</button>
    </div>
  );
};
```

## But, why?

Valtio has `useSnapshot` hook that can be used with proxy state,
which is similar to `useValtio`.

```jsx
import { useSnapshot } from 'valtio';
```

`useSnapshot` is implemented with `useSyncExternalStore` which is
a recommended way to use "external stores". It solves tearing issues.

However, the "Sync" behavior doesn't work nicely with concurrent rendering.
We can't use `startTransition` as expected.

`useValtio` doesn't use `useSyncExternalStore`,
but only `useReducer` and `useEffect`.
It suffers from tearing, but works better with concurrent rendering.

After all, it's a trade-off.

There's one caveat in `useValtio`.
To make it work with transitions, it forces "sync=true".
By default, `useSnapshot` works with "sync=false".

```js
const { count } = useValtio(state);
// That 👆 is equivalent to this 👇.
const { count } = useSnapshot(state, { sync: true });
```

## Examples

The [examples](examples) folder contains working examples.
You can run one of them with

```bash
PORT=8080 yarn run examples:01_typescript
```

and open <http://localhost:8080> in your web browser.

You can also try them in codesandbox.io:
[01](https://codesandbox.io/s/github/dai-shi/use-valtio/tree/main/examples/01_typescript)
[02](https://codesandbox.io/s/github/dai-shi/use-valtio/tree/main/examples/02_suspense)
