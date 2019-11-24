import React from 'react';
import './BottomLink.css';

/**
 * React component of a section bottom link.
 */
export class BottomLink extends React.Component {

  render() {
    return (
      <button className="BottomLink" onClick={this.props.onClick}>{this.props.text}</button>
    );
  }

}
