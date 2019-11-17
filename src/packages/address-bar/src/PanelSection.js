import React from 'react';
import { PanelListItem } from './PanelListItem';

export class PanelSection extends React.Component {
  static defaultProps = {
    items: [],
  };

  render() {
    return (
      <ul className="panel-section panel-section-list">
        {
          this.props.items.map((item, index) =>
            <PanelListItem key={index} text={item.text} onClick={item.onClick} />
          )
        }
      </ul>
    );
  }

}
