/* global browser */

describe('index.js', () => {

  afterEach(() => {
    browser.flush();
  });

  it('renders', async () => {
    const fakeProject = {name: 'Some project', pageUrl: 'https://127.0.0.1/', translationUrl: 'https://127.0.0.1/'}
    browser.runtime.sendMessage.resolves(fakeProject);

    const reactDomRender = await require('./index.js');
    const panelSection = await reactDomRender.default;

    expect(panelSection.constructor.name).toBe('PanelSection');
  });

});
