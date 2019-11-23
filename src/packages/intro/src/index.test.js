/* global browser */
import sinon from 'sinon';
import * as optionsModule from 'Commons/src/Options';

describe('index.js', () => {

  afterEach(() => {
    browser.flush();
  });

  it('renders', async () => {
    const optionsStub = sinon.stub(optionsModule, 'Options');
    sinon.stub(optionsStub, 'get').withArgs('locale_team').resolves({locale_team: 'cs'});
    sinon.stub(optionsModule.Options, 'create').callsFake(async () => optionsStub);

    const reactDomRender = await require('./index.js');
    const panelSection = await reactDomRender.default;

    expect(panelSection.constructor.name).toBe('TourDialog');
  });

});
