import React from 'react';
import './index.css';

/**
 * React component of a section bottom link.
 */
export class BottomLink extends React.Component {
  static defaultProps = {
    text: "",
    onClick: () => {},
  };

  render() {
    return (
      <button className="BottomLink" onClick={this.props.onClick}>{this.props.text}</button>
    );
  }

}
