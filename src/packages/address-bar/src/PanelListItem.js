import React from 'react';

export class PanelListItem extends React.Component {

  render() {
    return (
      <li className="panel-list-item" id="{this.props.id}" onClick={this.props.onClick}>{this.props.text}</li>
    );
  }

}
