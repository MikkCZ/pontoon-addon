import { renderHook, act } from '@testing-library/react-hooks';

import { useStateRef } from './useStateRef';

describe('useStateRef', () => {
  it('provides reference for the state value', () => {
    const initialValue = 'foo';

    const { result } = renderHook(() => useStateRef(initialValue));
    const [stateRef, _] = result.current;

    expect(stateRef.current).toBe(initialValue);
  });

  it('sets both the state value and the reference to new value', () => {
    const initialValue = 'foo';

    const { result } = renderHook(() => useStateRef(initialValue));
    const [stateRef, setState] = result.current;

    const newValue = 'bar';
    act(() => setState(newValue));

    expect(result.current[0].current).toBe(newValue);
    expect(stateRef.current).toBe(newValue);
  });

  it('sets both the state value and the reference to new value provided by a function', () => {
    const initialValue = 'foo';

    const { result } = renderHook(() => useStateRef(initialValue));
    const [stateRef, setState] = result.current;

    const newValue = 'bar';
    act(() => {
      setState((oldValue: unknown) => {
        expect(oldValue).toBe(initialValue);
        return newValue;
      });
    });

    expect(result.current[0].current).toBe(newValue);
    expect(stateRef.current).toBe(newValue);
  });
});
