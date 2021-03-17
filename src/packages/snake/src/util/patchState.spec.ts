import { patchState } from './patchState';

describe('patchState', () => {
  it('updates state with new values', () => {
    const setStateMock = jest.fn();

    patchState({ surname: 'Novak' }, setStateMock);

    expect(setStateMock).toHaveBeenCalledTimes(1);
    expect(setStateMock.mock.calls[0]).toHaveLength(1);
    expect(
      setStateMock.mock.calls[0][0]({ name: 'Jane', surname: 'Doe' })
    ).toEqual({ name: 'Jane', surname: 'Novak' });
  });

  it('does not update state if an empty update is provided', () => {
    const setStateMock = jest.fn();

    patchState({}, setStateMock);

    expect(setStateMock).not.toBeCalled();
  });
});
