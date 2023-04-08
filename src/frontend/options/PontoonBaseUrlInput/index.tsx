import React, { useEffect, useState } from 'react';

import { requestPermissionForPontoon } from '@commons/webExtensionsApi';
import { getOneOption, setOption } from '@commons/options';
import type { OptionsContent } from '@commons/data/defaultOptions';
import { Button } from '@frontend/commons/components/pontoon/Button';
import { InputLabel } from '@frontend/commons/components/pontoon/InputLabel';
import { UrlInput } from '@frontend/commons/components/pontoon/UrlInput';

export const PontoonBaseUrlInput: React.FC = () => {
  const [pontoonBaseUrl, setPontoonBaseUrlState] =
    useState<OptionsContent['pontoon_base_url']>('');
  const [disabled, setDisabled] = useState(true);

  useEffect(() => {
    (async () => {
      setPontoonBaseUrlState(await getOneOption('pontoon_base_url'));
    })();
  }, []);

  return (
    <div>
      <InputLabel htmlFor="pontoon_base_url">Pontoon URL</InputLabel>
      <UrlInput
        id="pontoon_base_url"
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
      <Button
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
      </Button>
      <aside>Changing Pontoon URL is for developers or debugging only.</aside>
    </div>
  );
};
