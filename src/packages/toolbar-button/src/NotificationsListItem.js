import React from 'react';
import ReactTimeAgo from 'react-time-ago';
import './NotificationsListItem.css';
if (!browser) { // eslint-disable-line no-use-before-define
  var browser = require('webextension-polyfill'); // eslint-disable-line no-var, no-inner-declarations
}

/**
 * React component of one notification shown in the list.
 */
export class NotificationsListItem extends React.Component {

  async _openTeamProject(projectUrl) {
    const teamProjectUrl = await this.props.backgroundPontoonClient.getTeamProjectUrl(projectUrl);
    browser.tabs.create({url: teamProjectUrl}).then(() => window.close());
  }

  render() {
    const links = [this.props.actor, this.props.target]
      .filter((it) => typeof(it) !== 'undefined' && it !== null)
      .filter((it) => it.hasOwnProperty('url'));
    const onClickAll = (e) => {
      if (links.length === 1) {
        _stopEvent(e);
        this._openTeamProject(links[0].url);
      }
    };
    return (
      <li className={`NotificationsListItem ${this.props.unread ? 'unread' : 'read'} ${links.length === 1 ? 'pointer' : ''}`}
        onClick={onClickAll}
      >
        {
          this.props.actor &&
            <button className="link"
              onClick={(e) => {
                _stopEvent(e);
                this._openTeamProject(this.props.actor.url);
              }}
            >{this.props.actor.anchor}</button>
        }
        {
          this.props.verb &&
            <span onClick={onClickAll}> {this.props.verb}</span>
        }
        {
          this.props.target &&
            <button className="link"
              onClick={(e) => {
                _stopEvent(e);
                this._openTeamProject(this.props.target.url);
              }}
            > {this.props.target.anchor}</button>
        }
        {
          this.props.date_iso &&
            <div className="NotificationsListItem-timeago" onClick={onClickAll}>
              <ReactTimeAgo date={ new Date(this.props.date_iso) } />
            </div>
        }
        {
          this.props.description &&
            <div className="NotificationsListItem-description" onClick={onClickAll}>
              {this.props.description}
            </div>
        }
      </li>
    );
  }

}

function _stopEvent(e) {
  e.preventDefault();
  e.stopPropagation();
}
