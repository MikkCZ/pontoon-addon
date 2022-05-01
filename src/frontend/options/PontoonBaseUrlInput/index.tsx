import React, { useEffect, useState } from 'react';

import { browser } from '@commons/webExtensionsApi';
import { getOneOption, setOption } from '@commons/options';

export const PontoonBaseUrlInput: React.FC = () => {
  const [pontoonBaseUrl, _setPontoonBaseUrlState] = useState<
    string | undefined
  >();
  const [disabled, setDisabled] = useState(true);

  useEffect(() => {
    (async () => {
      _setPontoonBaseUrlState(await getOneOption('pontoon_base_url'));
    })();
  }, []);

  const setPontoonBaseUrl = async (url: string) => {
    await browser.permissions.request({ origins: [`${url}/*`] });
    _setPontoonBaseUrlState(url);
    await setOption('pontoon_base_url', url);
  };

  return (
    <div>
      <label htmlFor="pontoon_base_url">Pontoon URL</label>
      <input
        id="pontoon_base_url"
        type="url"
        disabled={disabled}
        value={pontoonBaseUrl}
        onChange={(e) => setPontoonBaseUrl(e.target.value)}
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
