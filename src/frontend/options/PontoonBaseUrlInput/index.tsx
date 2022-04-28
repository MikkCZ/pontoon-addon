import React, { useEffect, useState } from 'react';

import { browser } from '@commons/webExtensionsApi';
import { Options } from '@commons/Options';

const OPTION_KEY = 'pontoon_base_url';

export const PontoonBaseUrlInput: React.FC<{ options: Options }> = ({
  options,
}) => {
  const [pontoonBaseUrl, _setPontoonBaseUrlState] = useState<
    string | undefined
  >();
  const [disabled, setDisabled] = useState(true);

  useEffect(() => {
    (async () => {
      _setPontoonBaseUrlState(
        (await options.get(OPTION_KEY))[OPTION_KEY] as string,
      );
    })();
  }, [options]);

  const setPontoonBaseUrl = async (url: string) => {
    await browser.permissions.request({ origins: [`${url}/*`] });
    _setPontoonBaseUrlState(url);
    await options.set(OPTION_KEY, url);
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
