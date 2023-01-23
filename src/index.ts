import { useEffect, useReducer } from 'react';
import type { ReducerWithoutAction } from 'react';
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

const get = <T extends object, Path extends readonly unknown[]>(
  obj: T,
  path: Path,
): Resolve<T, Path> => {
  let result: any = obj;
  for (let i = 0; i < path.length; ++i) {
    result = result[path[i] as keyof typeof result];
  }
  return result;
};

export function useValtio<State extends object>(proxy: State): Snapshot<State>;

export function useValtio<
  State extends object,
  Path extends readonly unknown[],
>(proxy: State, path: Path): Resolve<Snapshot<State>, Path>;

export function useValtio<
  State extends object,
  Path extends readonly unknown[],
>(proxy: State, path: Path = [] as any) {
  const getSlice = () =>
    get(
      // HACK the second parameter is to avoid handling promise
      snapshot(proxy, (x) => x as any),
      path,
    );
  type Result = ReturnType<typeof getSlice>;
  const [[sliceFromReducer, proxyFromReducer], rerender] = useReducer<
    ReducerWithoutAction<readonly [Result, State]>,
    undefined
  >(
    (prev) => {
      const nextSlice = getSlice();
      if (Object.is(prev[0], nextSlice) && prev[1] === proxy) {
        return prev;
      }
      return [nextSlice, proxy];
    },
    undefined,
    () => [getSlice(), proxy],
  );
  useEffect(() => {
    const unsubscribe = subscribe(proxy, rerender, true);
    rerender();
    return unsubscribe;
  }, [proxy]);
  let slice = sliceFromReducer;
  if (proxyFromReducer !== proxy) {
    rerender();
    slice = getSlice();
  }
  return slice;
}
