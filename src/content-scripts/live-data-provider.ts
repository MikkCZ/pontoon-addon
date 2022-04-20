import { BackgroundPontoonClient } from '@background/BackgroundPontoonClient';

new BackgroundPontoonClient().pageLoaded(
  document.location.toString(),
  document.documentElement.innerHTML
);
