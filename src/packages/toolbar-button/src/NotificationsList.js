import React from 'react';
import { NotificationsListItem } from './NotificationsListItem';
import { BottomLink } from './BottomLink';
import { NotificationsListError } from './NotificationsListError';
import './NotificationsList.css';
if (!browser) { // eslint-disable-line no-use-before-define
  var browser = require('webextension-polyfill'); // eslint-disable-line no-var, no-inner-declarations
}

/**
 * React component of the notifications list.
 */
export class NotificationsList extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      notificationsData: props.notificationsData,
    };
    this.props.backgroundPontoonClient.subscribeToNotificationsChange(this._notificationsChanged);
  }

  _notificationsChanged(change) {
    const notificationsData = change.newValue;
    this.setState({
      ...this.state,
      notificationsData: notificationsData,
    });
  }

  render() {
    if (this.state.notificationsData !== undefined) {
      const containsUnreadNotifications = Object.values(this.state.notificationsData)
        .some((notification) => notification.unread);
      return (
        <section className="NotificationsList">
          <ul className="NotificationsList-list">
            {
              Object.keys(this.state.notificationsData)
                .map((nKey) => Number.parseInt(nKey, 10))
                .sort((a, b) => a - b).reverse()
                .map((nKey) => this.state.notificationsData[nKey])
                .filter((notification) => notification.unread || !this.props.hideReadNotifications)
                .map((notificationData) =>
                  <NotificationsListItem
                    key={notificationData.id}
                    backgroundPontoonClient={this.props.backgroundPontoonClient}
                    {...notificationData}
                  />
                )
            }
          </ul>
          {
            containsUnreadNotifications &&
              <BottomLink
                className="NotificationsList-mark-all-as-read"
                text="Mark all Notifications as read"
                onClick={() => {
                  this.props.backgroundPontoonClient.markAllNotificationsAsRead();
                }}
              />
          }
          {
            !containsUnreadNotifications &&
              <BottomLink
                className="NotificationsList-see-all"
                text="See all Notifications"
                onClick={async () => {
                  const teamPageUrl = await this.props.backgroundPontoonClient.getTeamPageUrl();
                  browser.tabs.create({url: teamPageUrl}).then(() => window.close());
                }}
              />
          }
        </section>
      );
    } else {
      return (
        <NotificationsListError backgroundPontoonClient={this.props.backgroundPontoonClient} />
      );
    }
  }

}
