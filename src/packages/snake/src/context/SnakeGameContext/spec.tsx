import { renderHook } from '@testing-library/react-hooks';

import {
  snakeGameContextDefaultMockValue,
  SnakeGameContextProviderMock,
} from '../../test/SnakeGameContextMock';

import { SnakeGameContextProvider, useSnakeGameContext } from '.';

describe('SnakeGameContextProvider', () => {
  it('provides a value', () => {
    const { result } = renderHook(() => useSnakeGameContext(), {
      wrapper: SnakeGameContextProvider,
    });

    expect(result.current).toBeDefined();
  });
});

describe('useSnakeGameContext', () => {
  it('throws error when used outside of the provider', () => {
    const { result } = renderHook(() => useSnakeGameContext());

    expect(() => result.current).toThrow();
  });

  it('returns value from provider', () => {
    const { result } = renderHook(() => useSnakeGameContext(), {
      wrapper: SnakeGameContextProviderMock,
    });

    expect(result.current).toMatchObject({
      stateRef: snakeGameContextDefaultMockValue.stateRef,
    });
  });
});
