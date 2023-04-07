import { renderHook } from '@testing-library/react';

import {
  snakeGameContextDefaultMockValue,
  SnakeGameContextProviderMock,
} from '../test/SnakeGameContextMock';

import { SnakeGameContextProvider, useSnakeGameContext } from '.';

const consoleErrorSpy = jest.spyOn(console, 'error');

afterEach(() => {
  jest.resetAllMocks();
});

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
    consoleErrorSpy.mockReturnValue(undefined);
    expect(() => {
      renderHook(() => useSnakeGameContext());
    }).toThrow(
      '"useSnakeGameContext" hook may only be used inside "SnakeGameContextProvider".',
    );
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
