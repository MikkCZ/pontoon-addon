import type { Dispatch, SetStateAction } from 'react';

export function patchState<S>(
  update: Partial<S>,
  setState: Dispatch<SetStateAction<S>>,
): void {
  if (Object.keys(update).length > 0) {
    setState((oldValue) => ({ ...oldValue, ...update }));
  }
}
