import React from 'react';
import { PanelListItem } from '../PanelListItem';

/**
 * React component of a list, using Firefox style for panel menu.
 */
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
