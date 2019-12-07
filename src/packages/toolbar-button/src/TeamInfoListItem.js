import React from 'react';
import './TeamInfoListItem.css';

/**
 * React component of the team information item (activity or string).
 */
export class TeamInfoListItem extends React.Component {
  static defaultProps = {
    labelBeforeStyle: {},
    label: "",
    value: "",
    onClick: undefined,
  };

  render() {
    const children = (
      <React.Fragment>
        <span className="TeamInfoListItem-label-before" style={this.props.labelBeforeStyle}></span>
        <span className="TeamInfoListItem-label">{this.props.label}</span>
        <span className="TeamInfoListItem-value">{this.props.value}</span>
      </React.Fragment>
    );
    return (
      <li className="TeamInfoListItem">
        {
          this.props.onClick ?
            <button className="link" onClick={this.props.onClick}>
              {children}
            </button>
            :
            <React.Fragment>
              {children}
            </React.Fragment>
        }
      </li>
    );
  }

}
