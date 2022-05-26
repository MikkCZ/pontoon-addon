import React, { useEffect, useState } from 'react';

import type { OptionId } from '@commons/options';
import { getOneOption, setOption } from '@commons/options';

interface Props {
  optionKey: OptionId;
}

export const Checkbox: React.FC<Props> = ({ optionKey, children }) => {
  const [checked, setChecked] = useState<boolean | undefined>();

  useEffect(() => {
    (async () => {
      setChecked((await getOneOption(optionKey)) as boolean);
    })();
  }, [optionKey]);

  return (
    <label>
      <input
        type="checkbox"
        name={optionKey}
        checked={checked}
        onChange={(e) => {
          setChecked(e.target.checked);
          setOption(optionKey, e.target.checked);
        }}
      />
      {children}
    </label>
  );
};
