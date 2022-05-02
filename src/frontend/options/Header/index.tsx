import React from 'react';
import styled from 'styled-components';

import {
  openNewTab,
  openIntro,
  openPrivacyPolicy,
} from '@commons/webExtensionsApi';
import { pontoonAddonWiki } from '@commons/webLinks';
import pontoonLogo from '@assets/img/pontoon-logo.svg';

const Item = styled.li`
  display: inline-block;
  margin: 0 1em;

  &:last-child {
    margin-right: 0;
  }
`;

const HeaderLink = styled.button`
  appearance: none;
  display: inline-block;
  background: transparent;
  border: none;
  margin: 0;
  padding: 0;
  font-size: inherit;
  color: inherit;
  text-decoration: none;
  cursor: pointer;

  &:hover {
    color: #7bc876;
  }
`;

export const Header: React.FC = () => {
  return (
    <header>
      <img className="logo" src={pontoonLogo} alt="Pontoon logo" />
      <nav>
        <ul>
          <Item>
            <HeaderLink onClick={() => openIntro()}>Tour</HeaderLink>
          </Item>
          <Item>
            <HeaderLink
              onClick={() => {
                openNewTab(pontoonAddonWiki());
              }}
            >
              Wiki
            </HeaderLink>
          </Item>
          <Item>
            <HeaderLink onClick={() => openPrivacyPolicy()}>Privacy</HeaderLink>
          </Item>
        </ul>
      </nav>
    </header>
  );
};
