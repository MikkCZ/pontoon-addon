import React, { useEffect, useState } from 'react';
import type { ContextualIdentities } from 'webextension-polyfill';

import { browser } from '@commons/webExtensionsApi';
import { Options } from '@commons/Options';

type ContainerInfo = Pick<
  ContextualIdentities.ContextualIdentity,
  'cookieStoreId' | 'name'
>;

const OPTION_KEY = 'contextual_identity';

export const ContainerSelection: React.FC<{ options: Options }> = ({
  options,
}) => {
  const [containersList, setContainersList] = useState<
    ContainerInfo[] | undefined
  >();
  const [container, _setContainerState] = useState<string | undefined>();
  const [disabled, setDisabled] = useState(true);

  useEffect(() => {
    (async () => {
      setContainersList([
        { cookieStoreId: 'firefox-default', name: 'Default (no container)' },
        ...((await browser.contextualIdentities.query({})) as ContainerInfo[]),
      ]);
      _setContainerState((await options.get(OPTION_KEY))[OPTION_KEY] as string);
    })();
  }, [options]);

  const setContainer = async (cookieStoreId: string) => {
    _setContainerState(cookieStoreId);
    await options.set(OPTION_KEY, cookieStoreId);
  };

  return (
    <div>
      <label htmlFor="contextual_identity">
        Select container to use for data updates
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
        If you use a specific{' '}
        <a
          href="https://support.mozilla.org/kb/containers"
          target="_blank"
          rel="noreferrer"
        >
          container
        </a>{' '}
        for Pontoon, select it here.
      </aside>
    </div>
  );
};
