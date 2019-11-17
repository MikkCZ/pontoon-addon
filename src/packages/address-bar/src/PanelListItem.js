import React from 'react';

export class PanelListItem extends React.Component {

  render() {
    return (
      <li className="panel-list-item" onClick={this.props.onClick}>{this.props.text}</li>
    );
  }

}
