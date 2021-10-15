import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import '@testing-library/jest-dom/extend-expect';
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en.json';

configure({ adapter: new Adapter() });

TimeAgo.addLocale(en);
