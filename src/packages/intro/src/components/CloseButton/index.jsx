import React from 'react';
import closeIcon from '@assets/img/glyph-dismiss-16.svg'
import './index.css';
if (!browser) { // eslint-disable-line no-use-before-define
  var browser = require('webextension-polyfill'); // eslint-disable-line no-var, no-inner-declarations
}

function closeCurrentTab() {
  browser.tabs.query({currentWindow: true, active: true}).then((tabs) => {
    tabs.forEach((tab) => browser.tabs.remove(tab.id));
  });
}

/**
 * React component of a button, which closes the current tab on click.
 */
export class CloseButton extends React.Component {
  static defaultProps = {
    title: "",
    icon: closeIcon,
    onClick: () => { closeCurrentTab() },
    style: {},
  };

  render() {
    return (
      <button
        className="CloseButton"
        title={this.props.title}
        style={{ backgroundImage:`url(${this.props.icon})`, ...this.props.style }}
        onClick={() => this.props.onClick()}
      ></button>
    );
  }

}
