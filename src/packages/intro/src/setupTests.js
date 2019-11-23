import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import '@testing-library/jest-dom/extend-expect';
import browser from 'sinon-chrome/webextensions';

configure({ adapter: new Adapter() });

global.browser = browser;

global.flushPromises = async () => {
  return setImmediate(() => {});
}
