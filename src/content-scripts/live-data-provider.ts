import { pageLoaded } from '@background/backgroundClient';

pageLoaded(document.location.toString(), document.documentElement.innerHTML);
