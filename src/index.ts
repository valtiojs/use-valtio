import { useEffect, useReducer } from 'react';
import type { DispatchWithoutAction, Reducer } from 'react';
import { subscribe, snapshot } from 'valtio/vanilla';

type AsRef = { $$valtioRef: true };
type AnyFunction = (...args: any[]) => any;
type Snapshot<T> = T extends AnyFunction
  ? T
  : T extends AsRef
    ? T
    : {
        readonly [K in keyof T]: Snapshot<T[K]>;
      };

type Resolve<T, Path extends readonly unknown[]> = Path extends []
  ? T
  : Path extends [infer Head, ...infer Tail]
    ? Head extends keyof T
      ? Resolve<T[Head], Tail>
      : never
    : never;

const get = <T, Path extends readonly unknown[]>(
  obj: T,
  path: Path,
): Resolve<T, Path> => {
  let result: any = obj;
  for (let i = 0; i < path.length; ++i) {
    result = result[path[i] as keyof typeof result];
  }
  return result;
};

// HACK the second parameter for snapshot() to path through promise
const handlePromise = <T>(x: Promise<T>) => x as unknown as T;

export function useValtio<State extends object>(proxy: State): Snapshot<State>;

export function useValtio<
  State extends object,
  Path extends readonly unknown[],
>(proxy: State, path: Path): Resolve<Snapshot<State>, Path>;

export function useValtio<
  State extends object,
  Path extends readonly unknown[],
>(proxy: State, path: Path = [] as any) {
  const slice = get(snapshot(proxy, handlePromise), path);
  const [[sliceFromReducer, proxyFromReducer], rerender] = useReducer<
    Reducer<readonly [typeof slice, State], boolean | undefined>,
    undefined
  >(
    (prev, fromSelf?: boolean) => {
      if (fromSelf) {
        return [slice, proxy];
      }
      const nextSlice = get(snapshot(proxy, handlePromise), path);
      if (Object.is(prev[0], nextSlice) && prev[1] === proxy) {
        return prev;
      }
      return [nextSlice, proxy];
    },
    undefined,
    () => [slice, proxy],
  );
  useEffect(() => {
    const unsubscribe = subscribe(
      proxy,
      rerender as DispatchWithoutAction,
      true,
    );
    (rerender as DispatchWithoutAction)();
    return unsubscribe;
  }, [proxy]);
  if (proxyFromReducer !== proxy) {
    rerender(true);
    return slice;
  }
  if (!Object.is(sliceFromReducer, slice)) {
    rerender(true);
  }
  return sliceFromReducer;
}
