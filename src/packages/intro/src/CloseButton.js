import React from 'react';
import closeIcon from './static/img/glyph-dismiss-16.svg'
import './CloseButton.css';
if (!browser) { // eslint-disable-line no-use-before-define
  var browser = require('webextension-polyfill'); // eslint-disable-line no-var, no-inner-declarations
}

/**
 * React component of a button, which closes the current tab on click.
 */
export class CloseButton extends React.Component {
  static defaultProps = {
    title: "",
  };

  closeCurrentTab() {
    browser.tabs.query({currentWindow: true, active: true}).then((tabs) => {
      tabs.forEach((tab) => browser.tabs.remove(tab.id));
    });
  }

  render() {
    return (
      <button
        className="CloseButton"
        title={this.props.title}
        style={{ background:`url(${closeIcon}) no-repeat center` }}
        onClick={() => this.closeCurrentTab()}
      ></button>
    );
  }

}
