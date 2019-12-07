import React from 'react';
import 'Commons/static/css/pontoon.css';
import './NotificationsListError.css';
if (!browser) { // eslint-disable-line no-use-before-define
  var browser = require('webextension-polyfill'); // eslint-disable-line no-var, no-inner-declarations
}

/**
 * React component of the notifications list.
 */
export class NotificationsListError extends React.Component {
  static defaultProps = {
    backgroundPontoonClient: undefined,
  };

  render() {
    return (
      <section className="NotificationsListError">
        <p className="NotificationsListError-title">
          Error
        </p>
        <p className="NotificationsListError-description">
          There was an error fetching data from Pontoon. Please check, if you are <button
            className="NotificationsListError-sign-in link"
            onClick={async () => {
              const signInUrl = await this.props.backgroundPontoonClient.getSignInURL();
              browser.tabs.create({url: signInUrl}).then(() => window.close());
            }}>signed in</button>.
        </p>
      </section>
    );
  }

}
