import React, { useCallback, useEffect, useState } from 'react';

import { getAllContainers } from '@commons/webExtensionsApi';
import { containersInfoPage } from '@commons/webLinks';
import { getOneOption, setOption } from '@commons/options';
import type { OptionsContent } from '@commons/data/defaultOptions';
import { doAsync } from '@commons/utils';
import { Button } from '@frontend/commons/components/pontoon/Button';
import { InputLabel } from '@frontend/commons/components/pontoon/InputLabel';
import { SelectInput } from '@frontend/commons/components/pontoon/SelectInput';
import { NativeLink } from '@frontend/commons/components/pontoon/NativeLink';

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
    doAsync(async () => {
      setContainersList([
        { cookieStoreId: 'firefox-default', name: 'Default (no container)' },
        ...(await getAllContainers()),
      ]);
      _setContainerState(await getOneOption('contextual_identity'));
    });
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
      <InputLabel htmlFor="contextual_identity">
        Select container to use for opening Pontoon pages and accessing data
      </InputLabel>
      <SelectInput
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
      </SelectInput>{' '}
      <Button
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
      </Button>
      <aside>
        If you want to use a specific{' '}
        <NativeLink
          href={containersInfoPage()}
          target="_blank"
          rel="noopener noreferrer"
        >
          container
        </NativeLink>{' '}
        for Pontoon, select it here.
      </aside>
    </div>
  );
};
