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
    const linksCount = [this.props.actor, this.props.target].filter((it) => it !== null).length;
    const firstLink = [this.props.actor, this.props.target].find((it) => it !== null);
    const onClickAll = (e) => {
      if (linksCount === 1) {
        e.preventDefault();
        e.stopPropagation();
        this._openTeamProject(firstLink.url);
      }
    };
    return (
      <li className={`NotificationsListItem ${this.props.unread ? 'unread' : 'read'} ${linksCount === 1 ? 'pointer' : ''}`}
        onClick={onClickAll}
      >
        {
          this.props.actor &&
            <button className="link"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
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
                e.preventDefault();
                e.stopPropagation();
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
