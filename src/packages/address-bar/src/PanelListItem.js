import React from 'react';

/**
 * React component of one list item, using Firefox style for panel menu item.
 */
export class PanelListItem extends React.Component {

  render() {
    return (
      <li className="panel-list-item" onClick={this.props.onClick}>{this.props.text}</li>
    );
  }

}
