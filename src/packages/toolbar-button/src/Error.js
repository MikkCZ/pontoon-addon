import React from 'react';
import 'Commons/static/css/pontoon.css';
import './Error.css';
if (!browser) { // eslint-disable-line no-use-before-define
  var browser = require('webextension-polyfill'); // eslint-disable-line no-var, no-inner-declarations
}

/**
 * React component of the notifications list.
 */
export class Error extends React.Component {

  render() {
    return (
      <section className="Error">
        <p className="Error-title">
          Error
        </p>
        <p className="Error-description">
          There was an error fetching data from Pontoon. Please check, if you are <button
            className="Error-sign-in link"
            onClick={async () => {
              const signInUrl = await this.props.backgroundPontoonClient.getSignInURL();
              browser.tabs.create({url: signInUrl}).then(() => window.close());
            }}>signed in</button>.
        </p>
      </section>
    );
  }

}
