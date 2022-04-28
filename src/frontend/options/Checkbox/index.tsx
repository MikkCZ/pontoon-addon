import React, { useEffect, useState } from 'react';

import { Options, OptionId } from '@commons/Options';

interface Props {
  options: Options;
  optionKey: OptionId;
}

export const Checkbox: React.FC<Props> = ({ options, optionKey, children }) => {
  const [checked, setChecked] = useState<boolean | undefined>();

  useEffect(() => {
    (async () => {
      setChecked((await options.get(optionKey))[optionKey] as boolean);
    })();
  }, [options, optionKey]);

  return (
    <label>
      <input
        type="checkbox"
        name={optionKey}
        checked={checked}
        onChange={(e) => {
          setChecked(e.target.checked);
          options.set(optionKey, e.target.checked);
        }}
      />
      {children}
    </label>
  );
};
