import React, { useEffect, useState } from 'react';

import { requestPermissionForPontoon } from '@commons/webExtensionsApi';
import { getOneOption, setOption } from '@commons/options';
import type { OptionsContent } from '@commons/data/defaultOptions';

export const PontoonBaseUrlInput: React.FC = () => {
  const [pontoonBaseUrl, setPontoonBaseUrlState] =
    useState<OptionsContent['pontoon_base_url']>();
  const [disabled, setDisabled] = useState(true);

  useEffect(() => {
    (async () => {
      setPontoonBaseUrlState(await getOneOption('pontoon_base_url'));
    })();
  }, []);

  return (
    <div>
      <label htmlFor="pontoon_base_url">Pontoon URL</label>
      <input
        id="pontoon_base_url"
        type="url"
        disabled={disabled}
        value={pontoonBaseUrl}
        onChange={(e) => setPontoonBaseUrlState(e.target.value)}
        onBlur={async (e) => {
          const baseUrl = e.target.value.replace(/\/+$/, '');
          if (await requestPermissionForPontoon(baseUrl)) {
            setPontoonBaseUrlState(baseUrl);
            await setOption('pontoon_base_url', baseUrl);
          }
        }}
      />{' '}
      <button
        className="pontoon-style"
        onClick={() => {
          if (
            window.confirm(
              'Changing Pontoon URL is for developers only. I know what I am doing!',
            )
          ) {
            setDisabled(false);
          }
        }}
      >
        Edit
      </button>
      <aside>Changing Pontoon URL is for developers or debugging only.</aside>
    </div>
  );
};
