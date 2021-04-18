interface PontoonAddonInfo {
  installed: boolean;
}

interface Window {
  PontoonAddon: PontoonAddonInfo;
}

const pontoonAddonInfo: PontoonAddonInfo = {
  installed: true,
};

export function modifyWindow(window: Window): void {
  window.PontoonAddon = pontoonAddonInfo;
}

export function postMessage(): void {
  window.postMessage(
    JSON.stringify({
      _type: 'PontoonAddonInfo',
      value: pontoonAddonInfo,
    }),
    '*'
  ); // TODO: instead of asterisk, Pontoon URL from options
}
