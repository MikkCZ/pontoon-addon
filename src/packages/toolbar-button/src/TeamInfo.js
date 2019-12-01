import React from 'react';
import ReactTimeAgo from 'react-time-ago';
import { TeamInfoListItem } from './TeamInfoListItem';
import { BottomLink } from './BottomLink';
import lightbulbIcon from './static/img/lightbulb-blue.svg'
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

  async _openTeamStringsWithStatus(status) {
    const searchUrl = await this.props.backgroundPontoonClient.getStringsWithStatusSearchUrl(status);
    browser.tabs.create({url: searchUrl}).then(() => window.close());
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
          {
            this.props.latestActivity &&
              <TeamInfoListItem
                key="activity"
                label="Activity"
                value={
                  !isNaN(Date.parse(this.props.latestActivity.date_iso))
                  ?
                    <React.Fragment>
                      {this.props.latestActivity.user} <ReactTimeAgo date={ new Date(this.props.latestActivity.date_iso) } />
                    </React.Fragment>
                  : "―"
                }
              />
          }
          {
            [
              {status: 'translated', text: 'translated', dataProperty: 'approvedStrings', labelBeforeStyle: {backgroundColor:'#7bc876'}},
              {status: 'fuzzy', text: 'fuzzy', dataProperty: 'fuzzyStrings', labelBeforeStyle: {backgroundColor: '#fed271'}},
              {status: 'warnings', text: 'warnings', dataProperty: 'stringsWithWarnings', labelBeforeStyle: {backgroundColor:'#ffa10f'}},
              {status: 'errors', text: 'errors', dataProperty: 'stringsWithErrors', labelBeforeStyle: {backgroundColor:'#f36'}},
              {status: 'missing', text: 'missing', dataProperty: 'missingStrings', labelBeforeStyle: {backgroundColor:'#4d5967'}},
              {status: 'unreviewed', text: 'unreviewed', dataProperty: 'unreviewedStrings', labelBeforeStyle: {height:'1em', background:`center / contain no-repeat url(${lightbulbIcon})`}},
              {status: 'all', text: 'all strings', dataProperty: 'totalStrings'}
            ].map((category) =>
              <TeamInfoListItem
                key={category.status}
                labelBeforeStyle={category.labelBeforeStyle}
                label={category.text}
                value={this.props.stringsData[category.dataProperty]}
                onClick={() => this._openTeamStringsWithStatus(category.status)}
              />
            )
          }
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
