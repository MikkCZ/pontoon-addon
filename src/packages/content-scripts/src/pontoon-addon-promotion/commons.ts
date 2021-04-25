interface PontoonAddonInfo {
  installed: boolean;
}

export interface Window {
  PontoonAddon: PontoonAddonInfo;
}

export const pontoonAddonInfo: PontoonAddonInfo = {
  installed: true,
};
