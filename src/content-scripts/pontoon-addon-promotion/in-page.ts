import type { Window } from './commons';
import { pontoonAddonInfo } from './commons';

function modifyWindow(window: Window): void {
  window.PontoonAddon = pontoonAddonInfo;
}

modifyWindow(window as unknown as Window);
