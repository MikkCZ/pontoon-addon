import React, { useCallback, useEffect, useState } from 'react';

import { getAllContainers } from '@commons/webExtensionsApi';
import { containersInfoPage } from '@commons/webLinks';
import { getOneOption, setOption } from '@commons/options';
import type { OptionsContent } from '@commons/data/defaultOptions';

interface ContainerInfo {
  name: string;
  cookieStoreId: string;
}

export const ContainerSelection: React.FC = () => {
  const [containersList, setContainersList] = useState<ContainerInfo[]>();
  const [container, _setContainerState] =
    useState<OptionsContent['contextual_identity']>();
  const [disabled, setDisabled] = useState(true);

  useEffect(() => {
    (async () => {
      setContainersList([
        { cookieStoreId: 'firefox-default', name: 'Default (no container)' },
        ...(await getAllContainers()),
      ]);
      _setContainerState(await getOneOption('contextual_identity'));
    })();
  }, []);

  const setContainer = useCallback(
    async (cookieStoreId: string) => {
      _setContainerState(cookieStoreId);
      await setOption('contextual_identity', cookieStoreId);
    },
    [_setContainerState],
  );

  return (
    <div>
      <label htmlFor="contextual_identity">
        Select container to use for opening Pontoon pages and accessing data
      </label>
      <select
        id="contextual_identity"
        disabled={disabled}
        value={container}
        onChange={(e) => setContainer(e.target.value)}
      >
        {container &&
          containersList?.map((containerInfo) => (
            <option
              key={containerInfo.cookieStoreId}
              value={containerInfo.cookieStoreId}
            >
              {containerInfo.name}
            </option>
          ))}
      </select>{' '}
      <button
        className="pontoon-style"
        onClick={() => {
          if (
            window.confirm(
              'If you do not login to Pontoon in a container tab, it’s better to keep this option to default. Do you really want to change it?',
            )
          ) {
            setDisabled(false);
          }
        }}
      >
        Edit
      </button>
      <aside>
        If you want to use a specific{' '}
        <a href={containersInfoPage()} target="_blank" rel="noreferrer">
          container
        </a>{' '}
        for Pontoon, select it here.
      </aside>
    </div>
  );
};
