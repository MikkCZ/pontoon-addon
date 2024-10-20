import { TextEncoder, TextDecoder } from 'util'
import crypto from 'crypto';

import 'jest-webextension-mock';
import '@testing-library/jest-dom';
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en.json';

TimeAgo.addLocale(en);

globalThis.TextEncoder = TextEncoder;
// @ts-expect-error
globalThis.TextDecoder = TextDecoder;
// @ts-expect-error
globalThis.crypto = crypto;
