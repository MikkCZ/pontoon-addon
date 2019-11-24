import React from 'react';
import { BottomLink } from './BottomLink';
import 'Commons/static/css/pontoon.css';
import './TeamInfo.css';
if (!browser) { // eslint-disable-line no-use-before-define
  var browser = require('webextension-polyfill'); // eslint-disable-line no-var, no-inner-declarations
}

/**
 * React component of the localization team information.
 */
export class TeamInfo extends React.Component {

  async _openTeamPage() {
    const teamPageUrl = await this.props.backgroundPontoonClient.getTeamPageUrl();
    browser.tabs.create({url: teamPageUrl}).then(() => window.close());
  }

  render() {
    return (
      <section className="TeamInfo">
        <h1>
          <button className="link" onClick={() => this._openTeamPage()}>
            <span className="TeamInfo-name">{this.props.name}</span> <span className="TeamInfo-code">{this.props.code}</span>
          </button>
        </h1>
        <ul className="TeamInfo-list">

        </ul>
        <BottomLink
          className="TeamInfo-team-page"
          text="Open team page"
          onClick={() => this._openTeamPage()}
        />
      </section>
    );
  }

}
