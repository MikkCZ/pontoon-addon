import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import browser from 'sinon-chrome/webextensions';

configure({ adapter: new Adapter() });

global.browser = browser;
