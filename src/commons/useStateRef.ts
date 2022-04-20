import type { MutableRefObject, Dispatch, SetStateAction } from 'react';
import { useState, useRef, useCallback } from 'react';

export interface StateRef<S> extends MutableRefObject<S> {
  readonly current: S;
}

export function useStateRef<S>(
  initialState: S | (() => S)
): [StateRef<S>, Dispatch<SetStateAction<S>>] {
  const [stateValue, setState] = useState(initialState);
  const stateValueRef = useRef(stateValue);
  const updateRefAndSetState = useCallback(
    (newValueOrProvider: SetStateAction<S>) => {
      let newValue;
      if (typeof newValueOrProvider === 'function') {
        const provider = newValueOrProvider as (prevState: S) => S;
        newValue = provider(stateValueRef.current);
      } else {
        newValue = newValueOrProvider;
      }
      stateValueRef.current = newValue;
      setState(newValue);
    },
    [stateValueRef]
  );
  return [stateValueRef, updateRefAndSetState];
}
