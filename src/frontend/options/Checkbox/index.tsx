import React, { useEffect, useState } from 'react';

import type { OptionId } from '@commons/options';
import { getOneOption, setOption } from '@commons/options';
import { InputLabel } from '@frontend/commons/components/pontoon/InputLabel';
import { CheckboxInput } from '@frontend/commons/components/pontoon/CheckboxInput';

interface Props {
  optionKey: OptionId;
}

export const Checkbox: React.FC<Props> = ({ optionKey, children }) => {
  const [checked, setChecked] = useState<boolean>();

  useEffect(() => {
    (async () => {
      setChecked((await getOneOption(optionKey)) as boolean);
    })();
  }, [optionKey]);

  return (
    <InputLabel>
      <CheckboxInput
        name={optionKey}
        checked={checked}
        onChange={(e) => {
          setChecked(e.target.checked);
          setOption(optionKey, e.target.checked);
        }}
      />
      {children}
    </InputLabel>
  );
};
