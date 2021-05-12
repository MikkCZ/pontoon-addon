import ReactDOM from 'react-dom';

const reactDomRender = jest.spyOn(ReactDOM, 'render') as jest.Mock;

describe('index', () => {
  it('renders PrivacyPolicyRoot', async () => {
    const rootDiv = document.createElement('div');
    rootDiv.id = 'privacy-policy-root';
    document.body.appendChild(rootDiv);

    await require('.');

    expect(reactDomRender).toHaveBeenCalledTimes(1);
    expect(reactDomRender.mock.calls[0][1]).toBe(rootDiv);
  });
});
