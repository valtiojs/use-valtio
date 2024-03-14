import { useEffect, useMemo, useReducer } from 'react';
import type { ReducerWithoutAction } from 'react';
import { subscribe, snapshot } from 'valtio/vanilla';
import type { Snapshot } from 'valtio/vanilla';
import { createProxy, isChanged } from 'proxy-compare';

const targetCache = new WeakMap();

export function useValtio<State extends object>(proxy: State): Snapshot<State> {
  // per-hook affected, it's not ideal but memo compatible
  const affected = useMemo(() => new WeakMap<object, unknown>(), []);
  const [[snapshotFromReducer, proxyFromReducer], rerender] = useReducer<
    ReducerWithoutAction<readonly [Snapshot<State>, State]>,
    undefined
  >(
    (prev) => {
      const nextSnapshot = snapshot(proxy);
      if (
        prev[1] === proxy &&
        !isChanged(prev[0], nextSnapshot, affected, new WeakMap())
      ) {
        // not changed
        return prev;
      }
      return [nextSnapshot, proxy];
    },
    undefined,
    () => [snapshot(proxy), proxy],
  );
  let snapshotToReturn = snapshotFromReducer;
  if (proxyFromReducer !== proxy) {
    rerender();
    snapshotToReturn = snapshot(proxy);
  }
  useEffect(() => {
    const unsubscribe = subscribe(proxy, rerender, true);
    rerender();
    return unsubscribe;
  }, [proxy]);
  const proxyCache = useMemo(() => new WeakMap(), []); // per-hook proxyCache
  return createProxy(snapshotToReturn, affected, proxyCache, targetCache);
}
