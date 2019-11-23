import React from 'react';
import closeImg from './static/img/close-16.svg'
import './CloseButton.css';
if (!browser) { // eslint-disable-line no-use-before-define
  var browser = require('webextension-polyfill'); // eslint-disable-line no-var, no-inner-declarations
}

/**
 * React component of a button, which closes the current tab on click.
 */
export class CloseButton extends React.Component {

  closeCurrentTab() {
    browser.tabs.query({currentWindow: true, active: true}).then((tabs) => {
      tabs.forEach((tab) => browser.tabs.remove(tab.id));
    });
  }

  render() {
    return (
      <button id="close" title="Close the tour"
        style={{ ...this.props.style, background:`url(${closeImg}) no-repeat center` }}
        onClick={() => this.closeCurrentTab()}
      ></button>
    );
  }

}
