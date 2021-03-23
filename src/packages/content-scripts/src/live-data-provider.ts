import { BackgroundPontoonClient } from '@pontoon-addon/commons/src/BackgroundPontoonClient';

new BackgroundPontoonClient().pageLoaded(
  document.location.toString(),
  document.documentElement.innerHTML
);
