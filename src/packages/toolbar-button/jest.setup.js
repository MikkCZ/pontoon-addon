import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import '@testing-library/jest-dom/extend-expect';
import browser from 'sinon-chrome/webextensions';
import JavascriptTimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';

configure({ adapter: new Adapter() });

global.browser = browser;

global.flushPromises = () => {
  return new Promise((resolve) => setImmediate(resolve));
};

JavascriptTimeAgo.locale(en);
